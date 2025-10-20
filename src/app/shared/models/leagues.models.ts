import { Match, MatchResult } from './matches.models';

export interface League {
  id: string;
  matches: Match[];
}

export interface LeagueRanking {
  rank: number;
  team: string;
  matches: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  matchDetails: Match[];
  last5: [MatchResult?, MatchResult?, MatchResult?, MatchResult?];
}
