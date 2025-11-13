export interface Team {
  id: string;
  name: string;
  league: string;
  players?: TeamPlayer[];
}

export interface TeamPlayer {
  id: string;
  name: string;
  rights?: number;
  goals: number;
}
