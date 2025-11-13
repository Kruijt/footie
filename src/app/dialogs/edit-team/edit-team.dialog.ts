import { map } from 'rxjs';

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInput, MatLabel, MatSuffix } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatPrefix } from '@angular/material/select';

import { TeamDbService } from '../../core/services/database/team/team-db.service';
import { MatList, MatListItem } from '@angular/material/list';
import { MatButton, MatIconButton } from '@angular/material/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { TeamPlayer } from '../../shared/models/teams.models';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'f-edit-team',
  templateUrl: 'edit-team.dialog.html',
  styleUrl: 'edit-team.dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatPrefix,
    MatSuffix,
    ReactiveFormsModule,
    MatList,
    MatListItem,
    MatIconButton,
    MatButton,
  ],
})
export class EditTeamDialog {
  readonly td = inject(TeamDbService);

  readonly fb = inject(FormBuilder);

  readonly dr = inject(DialogRef);

  readonly teamForm = toSignal(
    this.td.team$.pipe(
      map((team) =>
        this.fb.group({
          name: this.fb.control(team?.name || '', {
            nonNullable: true,
            validators: [Validators.required],
          }),
          players: this.fb.array((team?.players || []).map((player) => this.createPlayer(player))),
          newPlayer: this.fb.control(''),
        }),
      ),
    ),
  );

  readonly playerFormArray = computed(() => this.teamForm()?.get('players') as FormArray<FormGroup>);

  onSubmitForm(): void {
    const form = this.teamForm();

    if (form?.valid) {
      const team = form.value;

      if (form.get('name')?.dirty) {
        this.td.updateTeam({ name: team.name });
      }

      const changedPlayers = this.playerFormArray()
        ?.controls.filter((ctrl) => ctrl.dirty)
        .map((ctrl) => ctrl.value);

      if (changedPlayers.length > 0) {
        this.td.updatePlayers(changedPlayers);
      }
    }

    this.dr.close();
  }

  deletePlayer(playerId: string) {
    const playersControl = this.playerFormArray();
    const idx = playersControl.controls.findIndex((ctrl) => ctrl.value.id === playerId);

    if (idx >= 0) {
      playersControl.removeAt(idx);
      playersControl.markAsDirty({ emitEvent: false });
    }
  }

  addPlayer(): void {
    const playersControl = this.playerFormArray();
    const newPlayerControl = this.teamForm()?.get('newPlayer');

    const newPlayerName = newPlayerControl?.value?.trim();

    if (newPlayerName) {
      const newPlayer = this.createPlayer({ name: newPlayerName });
      newPlayer.markAllAsDirty({ emitEvent: false });

      playersControl?.push(newPlayer);
      newPlayerControl?.setValue('');
    }
  }

  private createPlayer(player: Partial<TeamPlayer>): FormGroup {
    return this.fb.group({
      name: this.fb.control(player.name || '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      id: this.fb.control(player.id != null ? player.id : Math.random().toString()),
    });
  }
}
