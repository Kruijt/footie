import { map, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Component, inject } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SettingsDbService } from '../../../core/services/database/settings/settings-db.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'f-settings',
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
    imports: [
        FormsModule,
        MatCard,
        MatCardContent,
        MatCardHeader,
        MatCardTitle,
        ReactiveFormsModule,
        AsyncPipe,
        MatButton,
        MatSnackBarModule,
    ]
})
export class SettingsComponent {
  readonly fb = inject(FormBuilder);

  readonly sdb = inject(SettingsDbService);

  readonly sb = inject(MatSnackBar);

  readonly form$: Observable<FormGroup> = this.sdb.settings$.pipe(
    map((settings) => settings?.data()),
    map((settings) =>
      this.fb.group({
        general: this.fb.group({
          language: settings?.general?.language,
        }),
      }),
    ),
  );

  save(form: FormGroup): void {
    this.sdb.updateSettings(form.value).subscribe({
      next: () => {
        this.sb.open('Settings saved', 'Dismiss', { duration: 1000 });
      },
      error: () => this.sb.open('Failed to save settings', 'Dismiss', { duration: 5000, panelClass: 'snackbar-alert' }),
    });
  }
}
