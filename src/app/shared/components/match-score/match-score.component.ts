import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { Match } from '../../models/matches.models';
import { TeamPipe } from '../../pipes/team.pipe';

@Component({
  selector: 'f-match-score',
  templateUrl: './match-score.component.html',
  styleUrl: 'match-score.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TeamPipe, AsyncPipe, MatIcon],
})
export class MatchScoreComponent {
  readonly match = input.required<Match>();

  readonly scoreHomeTeam = computed(() => this.match().scoreHomeTeam ?? -1);
  readonly scoreAwayTeam = computed(() => this.match().scoreAwayTeam ?? -1);

  readonly homeWon = computed(() => this.scoreHomeTeam() > this.scoreAwayTeam());
  readonly awayWon = computed(() => this.scoreHomeTeam() < this.scoreAwayTeam());
}
