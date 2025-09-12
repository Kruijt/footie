import { onSchedule } from 'firebase-functions/v2/scheduler';

import { initializeApp } from 'firebase-admin/app';

import { JSDOM } from 'jsdom';
import axios from 'axios';

import { getCollection, safeKey, storeFileWithCheck } from '../utilities/firestore.utilities';
import { Match } from '../../../src/app/shared/models/matches.models';
import { Team } from '../../../src/app/shared/models/teams.models';
import { League } from '../../../src/app/shared/models/leagues.models';
import {
  MatchChangeNotification,
  RankingUpdateNotification,
  ScoreUpdateNotification,
  UserTeamNotifications,
} from '../../../src/app/shared/models/notifications.models';
import { User } from '../../../src/app/shared/models/user.models';
import { sendEmailWithAttachment } from '../utilities/mail-trap.utilities';
import { matchesToRanking } from '../../../src/app/shared/utilities/league.utilities';
import { TemplateVariables } from 'mailtrap/dist/types/mailtrap';

initializeApp();

export const syncDataService = onSchedule(
  { schedule: '0 15 */3 * *', maxInstances: 1, region: 'europe-west1', invoker: 'private' },
  async () => {
    const matchPageData = new JSDOM((await axios.get('https://www.zvvdebevelanden.nl/speelschema/')).data);
    const matchPage = matchPageData.window.document;
    const teamNames: Record<string, string> = {};

    const leagueMatches = [
      ...Array.from(matchPage.querySelectorAll('.round_table .even_row:not(.mobile_row)') || []),
      ...Array.from(matchPage.querySelectorAll('.round_table .odd_row:not(.mobile_row)') || []),
    ]
      .map((row) => {
        const [id, date, time, location, homeTeam, awayTeam, score, referee, notes] = Array.from(
          row.querySelectorAll('td') || [],
        ).map((td) => td.textContent?.trim() || '');

        const league = id.split('-').shift() || '';

        const [day, month, year] =
          date
            ?.split(' ')?.[1]
            .split('-')
            .map((value) => parseInt(value)) || [];
        const [hour, minute] = time?.split(':').map((value) => parseInt(value)) || [];
        const [scoreHomeTeam = null, scoreAwayTeam = null] = score
          .split('-')
          .map((value) => (value ? parseInt(value) : null));

        teamNames[safeKey(homeTeam)] = homeTeam;
        teamNames[safeKey(awayTeam)] = awayTeam;

        return {
          id,
          league,
          time: new Date(parseInt(`20${year}`), month - 1, day, hour, minute).getTime(),
          dateParts: [parseInt(`20${year}`), month - 1, day, hour, minute],
          location,
          homeTeam: safeKey(homeTeam),
          awayTeam: safeKey(awayTeam),
          scoreHomeTeam,
          scoreAwayTeam,
          referee,
          notes,
        };
      })
      .sort((a, b) => a.time - b.time)
      .reduce((leagues, match) => {
        const league =
          leagues.find((league) => league.id === match.league) ||
          ({ id: match.league, matches: [] } as { id: string; matches: Match[] });

        if (!leagues.includes(league)) {
          leagues.push(league);
        }

        league.matches.push(match);

        return leagues;
      }, [] as League[]);

    const teams: Team[] = leagueMatches
      .reduce((allMatches, league) => {
        allMatches.push(...league.matches);

        return allMatches;
      }, [] as Match[])
      .reduce((teams, match) => {
        const league = match.id.split('-').shift() || '';
        const homeTeamName = teamNames[safeKey(match.homeTeam)];
        const awayTeamName = teamNames[safeKey(match.awayTeam)];

        const homeTeam = teams.find((team) => team.name === homeTeamName) || {
          name: homeTeamName,
          id: safeKey(match.homeTeam),
          league,
        };

        const awayTeam = teams.find((team) => team.name === awayTeamName) || {
          name: awayTeamName,
          id: safeKey(match.awayTeam),
          league,
        };

        if (!teams.includes(awayTeam)) {
          teams.push(awayTeam);
        }

        if (!teams.includes(homeTeam)) {
          teams.push(homeTeam);
        }

        return teams;
      }, [] as Team[])
      .sort((a, b) => a.id.localeCompare(b.id));

    await Promise.all([
      storeFileWithCheck('teams.json', JSON.stringify(teams)),
      ...leagueMatches.map(async (league) => {
        const oldLeagueData = await storeFileWithCheck(`league-${league.id}.json`, JSON.stringify(league));

        if (oldLeagueData) {
          await processLeagueNotifications(JSON.parse(oldLeagueData), league);
        }
      }),
    ]);

    async function processLeagueNotifications(oldLeague: League, newLeague: League) {
      const userNotifications = await getUsersNotifications();

      await Promise.all(
        userNotifications.map(async (userNotification) =>
          checkUserNotification(userNotification, oldLeague, newLeague),
        ),
      );
    }

    async function checkUserNotification(
      userNotification: UserTeamNotifications,
      oldLeague: League,
      newLeague: League,
    ): Promise<void> {
      const scoreUpdates = getScoreUpdateNotifications(userNotification, oldLeague, newLeague);
      const matchChanges = getMatchChangesNotification(userNotification, oldLeague, newLeague);
      const rankingUpdate = getRankingUpdateNotification(userNotification, oldLeague, newLeague);

      const notifications = [
        ...(scoreUpdates ? [scoreUpdates] : []),
        ...(matchChanges ? [matchChanges] : []),
        ...(rankingUpdate ? [rankingUpdate] : []),
      ];

      if (notifications.length > 0) {
        await sendEmailWithAttachment(userNotification.email, '89a2f343-efc3-4d72-b9cf-901f0bf727e6', {
          userName: userNotification.name,
          teamName: teamNames[userNotification.team],
          notifications: notifications,
        } as unknown as TemplateVariables);
      }
    }

    function getScoreUpdateNotifications(
      notification: UserTeamNotifications,
      oldLeague: League,
      newLeague: League,
    ): ScoreUpdateNotification | undefined {
      const changedMatches = getChangedMatches(
        oldLeague,
        newLeague,
        notification.team,
        (oldMatch: Match, newMatch: Match) =>
          oldMatch.scoreAwayTeam !== newMatch.scoreAwayTeam || oldMatch.scoreHomeTeam !== newMatch.scoreHomeTeam,
      );

      if (changedMatches.length) {
        return {
          isScoreUpdate: true,
          updates: changedMatches.map(([newMatch]) => ({
            homeTeam: teamNames[newMatch.homeTeam],
            homeScore: newMatch.scoreHomeTeam?.toString() || '-',
            awayTeam: teamNames[newMatch.awayTeam],
            awayScore: newMatch.scoreAwayTeam?.toString() || '-',
          })),
        };
      }

      return;
    }

    function getMatchChangesNotification(
      notification: UserTeamNotifications,
      oldLeague: League,
      newLeague: League,
    ): MatchChangeNotification | undefined {
      const changedMatches = getChangedMatches(
        oldLeague,
        newLeague,
        notification.team,
        (oldMatch: Match, newMatch: Match) =>
          oldMatch.time !== newMatch.time ||
          oldMatch.location !== newMatch.location ||
          oldMatch.homeTeam !== newMatch.homeTeam ||
          oldMatch.awayTeam !== newMatch.awayTeam,
      );

      if (changedMatches.length) {
        return {
          isMatchChange: true,
          updates: changedMatches.map(([newMatch, oldMatch]) => {
            const oldTeam = (oldMatch?.awayTeam === notification.team ? oldMatch?.homeTeam : oldMatch?.awayTeam) || '-';
            const newTeam = (newMatch.awayTeam === notification.team ? newMatch.homeTeam : newMatch.awayTeam) || '-';
            const oldLocation = oldMatch?.location || '-';
            const newLocation = newMatch.location || '-';
            const oldTime = getTimeFromMatch(oldMatch);
            const newTime = getTimeFromMatch(newMatch);

            return {
              oldTeam: teamNames[oldTeam] || '-',
              newTeam: teamNames[newTeam] || '-',
              oldLocation,
              newLocation,
              oldTime,
              newTime,
            };
          }),
        };
      }

      return;
    }

    function getTimeFromMatch(match?: Match): string {
      const [year = '????', month = '??', day = '??', hour = '??', minute = '??'] = match?.dateParts || [];

      return `${day.toString().padStart(2, '0')}-${typeof month === 'string' ? month : (month + 1).toString().padStart(2, '0')}-${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }

    function getRankingUpdateNotification(
      notification: UserTeamNotifications,
      oldLeague: League,
      newLeague: League,
    ): RankingUpdateNotification | undefined {
      const oldRank =
        matchesToRanking(oldLeague.matches).find((ranking) => ranking.team === notification.team)?.rank ?? '-';
      const newRank =
        matchesToRanking(newLeague.matches).find((ranking) => ranking.team === notification.team)?.rank ?? '-';

      if (oldRank !== newRank) {
        return {
          isRankingUpdate: true,
          update: { oldRank, newRank },
        };
      }

      return;
    }

    function geTeamMatchesFromLeague(league: League, team: string): Match[] {
      return league.matches.filter((match) => match.homeTeam === team || match.awayTeam === team);
    }

    function getChangedMatches(
      oldLeague: League,
      newLeague: League,
      team: string,
      check: (oldMatch: Match, newMatch: Match) => boolean,
    ): [Match, Match?][] {
      const oldMatches = geTeamMatchesFromLeague(oldLeague, team);
      const newMatches = geTeamMatchesFromLeague(newLeague, team);

      return newMatches.reduce(
        (changedMatches, newMatch) => {
          const oldMatch = oldMatches.find((match) => match.id === newMatch.id);

          if (!oldMatch) {
            changedMatches.push([newMatch, undefined]);
          } else if (check(oldMatch, newMatch)) {
            changedMatches.push([newMatch, oldMatch]);
          }

          return changedMatches;
        },
        [] as [Match, Match?][],
      );
    }

    async function getUsersNotifications(): Promise<UserTeamNotifications[]> {
      const users = await getCollection<User>('users');

      return users.reduce((notifications, user) => {
        if (!user.team || !user.notifications?.length || !user.email) {
          return notifications;
        }

        const notification = notifications.find((n) => n.user === user.$id) || {
          user: user.$id,
          name: user.name || user.email,
          email: user.email,
          team: user.team,
          notifications: user.notifications,
        };

        if (!notifications.includes(notification)) {
          notifications.push(notification);
        }

        return notifications;
      }, [] as UserTeamNotifications[]);
    }
  },
);
