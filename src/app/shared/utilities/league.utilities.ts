import { LeagueRanking } from '../models/leagues.models';
import { Match, MatchResult } from '../models/matches.models';

export const matchesToRanking = (matches: Match[]): LeagueRanking[] =>
  matches
    .reduce((ranking, match) => {
      const homeTeamRanking = ranking.find((rank) => rank.team === match.homeTeam) || getDefaultRanking(match.homeTeam);
      const awayTeamRanking = ranking.find((rank) => rank.team === match.awayTeam) || getDefaultRanking(match.awayTeam);

      if (match.scoreHomeTeam != null && match.scoreAwayTeam != null) {
        addMatchToRankings([homeTeamRanking, awayTeamRanking], match);
      }

      homeTeamRanking.matchDetails.push(match);
      awayTeamRanking.matchDetails.push(match);

      if (!ranking.includes(homeTeamRanking)) {
        ranking.push(homeTeamRanking);
      }

      if (!ranking.includes(awayTeamRanking)) {
        ranking.push(awayTeamRanking);
      }

      return ranking;
    }, [] as LeagueRanking[])
    .sort((a, b) => {
      const pointDiff = a.points - b.points || a.goalsFor - a.goalsAgainst - (b.goalsFor - b.goalsAgainst);

      if (pointDiff > 0) return -1;
      if (pointDiff < 0) return 1;
      return 0;
    })
    .map((ranking, index) => {
      ranking.rank = index + 1;

      return ranking;
    });

export const getDefaultRanking = (team: string): LeagueRanking => {
  return {
    rank: 0,
    team: team,
    matches: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    last5: [],
    matchDetails: [],
  };
};

export const addMatchToRankings = ([homeRanking, awayRanking]: [LeagueRanking, LeagueRanking], match: Match): void => {
  const scoreHomeTeam = match.scoreHomeTeam ?? 0;
  const scoreAwayTeam = match.scoreAwayTeam ?? 0;

  addResultToRanking(homeRanking, scoreHomeTeam, scoreAwayTeam);
  addResultToRanking(awayRanking, scoreAwayTeam, scoreHomeTeam);
};

export const addResultToRanking = (ranking: LeagueRanking, scoreFor: number, scoreAgainst: number): void => {
  const scoreDiff = scoreFor - scoreAgainst;
  const result = scoreDiff > 0 ? MatchResult.Won : scoreDiff < 0 ? MatchResult.Lost : MatchResult.Draw;
  ranking.matches++;
  ranking.won += result === MatchResult.Won ? 1 : 0;
  ranking.draw += result === MatchResult.Draw ? 1 : 0;
  ranking.lost += result === MatchResult.Lost ? 1 : 0;
  ranking.goalsFor += scoreFor;
  ranking.goalsAgainst += scoreAgainst;
  ranking.points += result;
  ranking.last5.push(result);

  if (ranking.last5.length > 5) {
    ranking.last5.shift();
  }
};
