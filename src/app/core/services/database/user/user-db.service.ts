import { map, Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { UserFirestoreService } from '../core/firestore/user-firestore.service';
import { User } from '../../../../shared/models/user.models';

@Injectable({
  providedIn: 'root',
})
export class UserDbService extends UserFirestoreService {
  readonly userData$: Observable<User | null> = this.getDoc<User>(`users`).pipe(map((data) => data?.data() || null));

  setUser(user: User) {
    return this.updateDoc('users', user, true);
  }

  updateUser(update: Partial<User>) {
    return this.updateDoc('users', update);
  }
}
