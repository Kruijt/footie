import { combineLatest, map, shareReplay } from 'rxjs';

import { Auth } from '@angular/fire/auth';
import { MatOption, MatPrefix, MatSelect } from '@angular/material/select';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

import { TeamsStorageService } from '../../../core/services/database/teams/teams-storage.service';
import { NotificationType, notificationTypeLabel } from '../../../shared/models/notifications.models';
import { UserDbService } from '../../../core/services/database/user/user-db.service';

@Component({
  selector: 'f-setup',
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    AsyncPipe,
    MatOption,
    MatButton,
    ReactiveFormsModule,
    MatInput,
    MatProgressSpinner,
    MatPrefix,
    MatIcon,
  ],
})
export class SetupComponent {
  protected readonly notificationTypes = Object.values(NotificationType);

  protected readonly notificationTypeLabel = notificationTypeLabel;

  readonly router = inject(Router);

  readonly ts = inject(TeamsStorageService);

  readonly us = inject(UserDbService);

  readonly fb = inject(FormBuilder);

  readonly auth = inject(Auth);

  readonly setupForm$ = combineLatest([this.us.userData$, this.ts.userTeam$]).pipe(
    map(([user, team]) =>
      this.fb.group({
        name: this.fb.control(user?.name || this.auth.currentUser?.displayName || '', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        email: this.fb.control(user?.email || this.auth.currentUser?.email || '', {
          nonNullable: true,
          validators: [Validators.required, Validators.email],
        }),
        team: this.fb.control(team?.id, { nonNullable: true, validators: [Validators.required] }),
        notifications: this.fb.control(user?.notifications || [], { nonNullable: true }),
      }),
    ),
    shareReplay(1),
  );

  readonly submitting = signal(false);

  onSubmit(setupForm: FormGroup): void {
    if (!setupForm.valid) {
      return;
    }

    this.submitting.set(true);

    this.us.setUser(setupForm.value).subscribe(() => {
      this.submitting.set(false);

      this.router.navigate(['dashboard']);
    });
  }
}
