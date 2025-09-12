import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Match } from '../../models/matches.models';

@Component({
  selector: 'f-match-header',
  templateUrl: './match-header.component.html',
  styleUrl: 'match-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatIcon],
})
export class MatchHeaderComponent {
  readonly match = input.required<Match>();
}
