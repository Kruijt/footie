import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'f-setup',
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class SetupComponent {}
