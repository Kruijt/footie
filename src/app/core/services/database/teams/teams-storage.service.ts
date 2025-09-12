import { defer, map, Observable, of, shareReplay, switchMap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { Team } from '../../../../shared/models/teams.models';
import { UserDbService } from '../user/user-db.service';
import { StorageService } from '../core/storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class TeamsStorageService extends StorageService {
  readonly udb = inject(UserDbService);

  readonly teams$: Observable<Team[]> = defer(() => this.getJSONFile<Team[]>(`teams.json`)).pipe(shareReplay(1));

  readonly userTeam$: Observable<Team | undefined> = this.udb.userData$.pipe(
    switchMap((user) => (user?.team ? this.getTeam(user.team) : of(undefined))),
    shareReplay(1),
  );

  readonly userTeamLeague$: Observable<string | undefined> = this.userTeam$.pipe(map((team) => team?.league));

  getTeam(teamId: string): Observable<Team | undefined> {
    return this.teams$.pipe(map((teams) => teams.find((team) => team.id === teamId)));
  }
}
