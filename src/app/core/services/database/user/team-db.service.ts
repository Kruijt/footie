import { Injectable } from '@angular/core';
import { AuthFirestoreService } from '../core/firestore/auth-firestore.service';

@Injectable({
  providedIn: 'root',
})
export class TeamDbService extends AuthFirestoreService {
  // readonly players$: Observable<User | null> = this.getDoc<User>(`users`).pipe(
  //   map((data) => data?.data() || null),
  //   shareReplay(1),
  // );
  //
  // setUser(user: User) {
  //   return this.updateDoc('users', user, true);
  // }
  //
  // updateUser(update: Partial<User>) {
  //   return this.updateDoc('users', update);
  // }
}
