import { MatIcon } from '@angular/material/icon';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { MatchResult } from '../../models/matches.models';
import { LeagueRanking } from '../../models/leagues.models';

@Component({
  selector: 'f-match-last-5',
  templateUrl: './match-last-5.component.html',
  styleUrl: 'match-last-5.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, MatIcon],
})
export class MatchLast5Component {
  readonly ranking = input.required<LeagueRanking>();
  protected readonly MatchResult = MatchResult;
}
