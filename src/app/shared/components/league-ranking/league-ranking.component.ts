import { ChangeDetectionStrategy, Component, input, signal, TemplateRef, viewChild } from '@angular/core';
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
import { AsyncPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
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
    NgTemplateOutlet,
    DatePipe,
  ],
})
export class LeagueRankingComponent {
  readonly leagueRankings = input.required<LeagueRanking[]>();

  readonly team = input<Team | undefined | null>();

  readonly teamCellTmpl = viewChild<TemplateRef<{ $implicit: LeagueRanking }>>('teamCellTmpl');

  readonly goalsCellTmpl = viewChild<TemplateRef<{ $implicit: LeagueRanking }>>('goalsCellTmpl');

  readonly last5CellTmpl = viewChild<TemplateRef<{ $implicit: LeagueRanking }>>('last5CellTmpl');

  readonly displayedColumns = ['rank', 'team', 'points', 'matches', 'won', 'draw', 'lost', 'goals', 'last5'];

  readonly stickyColumns = [true, true];

  readonly columnHeaders = ['#', 'Team', 'P', 'M', 'W', 'D', 'L', 'G', 'Last 5'];

  readonly columnCells = [
    undefined,
    this.teamCellTmpl,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    this.goalsCellTmpl,
    this.last5CellTmpl,
  ];

  readonly teamMatchDetailsExpanded = signal<string[]>([]);

  toggleTeamMatchDetails(team: string): void {
    const expanded = [...this.teamMatchDetailsExpanded()];

    if (expanded.includes(team)) {
      expanded.splice(expanded.indexOf(team), 1);
    } else {
      expanded.push(team);
    }

    this.teamMatchDetailsExpanded.set(expanded);
  }
}
