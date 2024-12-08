import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { DocumentSnapshot } from '@angular/fire/compat/firestore';

import { Settings } from '../../../../shared/models/settings.models';
import { lastValue } from '../../../operators/last-value.operator';
import { UserFirestoreService } from '../core/user-firestore.service';

@Injectable({
  providedIn: 'root',
})
export class SettingsDbService extends UserFirestoreService {
  readonly settings$: Observable<DocumentSnapshot<Settings> | null> = this.getDoc<Settings>(`settings`);

  updateSettings(settings: Settings) {
    return this.updateDoc(`settings`, settings, !lastValue(this.settings$)?.exists);
  }
}
