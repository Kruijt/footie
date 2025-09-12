import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LeagueRanking } from '../../models/leagues.models';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { TeamPipe } from '../../pipes/team.pipe';
import { AsyncPipe } from '@angular/common';
import { MatchLast5Component } from '../match-last-5/match-last-5.component';
import { Team } from '../../models/teams.models';

@Component({
  selector: 'f-league-ranking',
  templateUrl: './league-ranking.component.html',
  styleUrl: 'league-ranking.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    TeamPipe,
    AsyncPipe,
    MatchLast5Component,
  ],
})
export class LeagueRankingComponent {
  readonly leagueRankings = input.required<LeagueRanking[]>();

  readonly team = input<Team | undefined | null>();

  readonly displayedColumns = ['rank', 'team', 'points', 'matches', 'won', 'draw', 'lost', 'goals', 'last5'];
}
