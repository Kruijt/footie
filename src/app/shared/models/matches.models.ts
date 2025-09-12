export interface Match {
  id: string;
  league: string;
  time: number;
  dateParts: number[];
  location: string;
  homeTeam: string;
  awayTeam: string;
  scoreHomeTeam: number | null;
  scoreAwayTeam: number | null;
  referee: string;
  notes: string;
}

export enum MatchResult {
  Lost = 0,
  Draw = 1,
  Won = 3,
}
