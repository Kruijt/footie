import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { AsyncPipe } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCell, MatCellDef, MatColumnDef, MatRow, MatRowDef, MatTable } from '@angular/material/table';

import { TeamDbService } from '../../../core/services/database/team/team-db.service';
import { TeamPlayer } from '../../models/teams.models';
import { BehaviorSubject, combineLatest, map, scan, shareReplay } from 'rxjs';

@Component({
  selector: 'f-top-scorers',
  templateUrl: './top-scorers.component.html',
  styleUrl: './top-scorers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    MatAccordion,
    MatCard,
    MatCardContent,
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatIcon,
    MatTable,
    MatRow,
    MatRowDef,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatIconButton,
  ],
})
export class TopScorersComponent {
  readonly td = inject(TeamDbService);

  readonly panelToggled = new BehaviorSubject(false);

  readonly topScorers$ = combineLatest([this.td.topScorers$, this.panelToggled]).pipe(
    scan((topScorers, [newTopScorers, expanded]) => {
      if (expanded) {
        const newPlayers = newTopScorers.filter(
          (player) => !topScorers.some((topScorer) => topScorer.id === player.id),
        );
        topScorers.push(...newPlayers);
        return topScorers.map((topScorer) => newTopScorers.find((player) => player.id === topScorer.id) as TeamPlayer);
      } else {
        return newTopScorers;
      }
    }, [] as TeamPlayer[]),
    shareReplay(1),
  );

  readonly topScorer$ = this.topScorers$.pipe(
    map((topScorers) => {
      let name = '';
      let goals = 0;

      topScorers.forEach((topScorer) => {
        if (topScorer.goals) {
          if (topScorer.goals > goals) {
            name = topScorer.name;
            goals = topScorer.goals;
          } else if (topScorer.goals === goals) {
            name += `, ${topScorer.name}`;
          }
        }
      });

      return {
        name,
        goals,
      };
    }),
  );

  onAddGoal(player: TeamPlayer): void {
    const goals = player.goals + 1;

    this.td.setGoals(player, goals);
  }

  onRemoveGoal(player: TeamPlayer): void {
    const goals = Math.max(0, player.goals - 1);

    this.td.setGoals(player, goals);
  }
}
