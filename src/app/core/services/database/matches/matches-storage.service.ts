import { map, Observable, of, shareReplay, switchMap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { Match } from '../../../../shared/models/matches.models';
import { League, LeagueRanking } from '../../../../shared/models/leagues.models';
import { TeamsStorageService } from '../teams/teams-storage.service';
import { StorageService } from '../core/storage/storage.service';
import { matchesToRanking } from '../../../../shared/utilities/league.utilities';

@Injectable({
  providedIn: 'root',
})
export class MatchesStorageService extends StorageService {
  readonly tdb = inject(TeamsStorageService);

  readonly allMatches$: Observable<Match[]> = this.tdb.userTeamLeague$.pipe(
    switchMap((league) =>
      league ? this.getJSONFile<League>(`league-${league}.json`).then((league) => league.matches) : of([]),
    ),
    map((matches) =>
      matches
        .map((match) => {
          const [year, month, day, hour, minute] = match.dateParts;
          match.time = new Date(year, month, day, hour, minute).getTime();

          return match;
        })
        .sort((a, b) => a.time - b.time),
    ),
    shareReplay(1),
  );

  readonly playedMatches$: Observable<Match[]> = this.allMatches$.pipe(
    map((matches) => matches.filter((match) => match.scoreHomeTeam != null && match.scoreAwayTeam != null)),
    shareReplay(1),
  );

  readonly teamMatches$ = this.tdb.userTeam$.pipe(
    switchMap((team) =>
      team?.id
        ? this.allMatches$.pipe(
            map((matches) => matches.filter((match) => match.homeTeam === team.id || match.awayTeam === team.id)),
          )
        : of([]),
    ),
    shareReplay(1),
  );

  readonly upcomingTeamMatches$: Observable<Match[]> = this.teamMatches$.pipe(
    map((matches) => matches.filter((match) => match.scoreHomeTeam == null && match.scoreAwayTeam == null)),
    shareReplay(1),
  );

  readonly lastMatch$: Observable<Match | void> = this.teamMatches$.pipe(
    map((matches) => matches.reverse().find((match) => match.time < Date.now())),
    shareReplay(1),
  );

  readonly nextMatch$: Observable<Match | void> = this.teamMatches$.pipe(
    map((matches) => matches.find((match) => match.time > Date.now())),
    shareReplay(1),
  );

  readonly leagueRankings$: Observable<LeagueRanking[]> = this.playedMatches$.pipe(
    map((matches) => matchesToRanking(matches)),
    shareReplay(1),
  );

  readonly teamRanking$: Observable<LeagueRanking | undefined> = this.tdb.userTeam$.pipe(
    switchMap((team) =>
      team?.id
        ? this.leagueRankings$.pipe(map((rankings) => rankings.find((rank) => rank.team === team.id)))
        : of(undefined),
    ),
    shareReplay(1),
  );
}
