import { Observable } from 'rxjs';

import { inject, Pipe, PipeTransform } from '@angular/core';

import { Team } from '../models/teams.models';
import { TeamsStorageService } from '../../core/services/database/teams/teams-storage.service';

@Pipe({
  name: 'team',
})
export class TeamPipe implements PipeTransform {
  readonly tds = inject(TeamsStorageService);

  transform(value: string): Observable<Team | undefined> {
    return this.tds.getTeam(value);
  }
}
