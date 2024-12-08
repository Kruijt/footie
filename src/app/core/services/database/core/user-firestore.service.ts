import { map, Observable, of, switchMap } from 'rxjs';

import { user, User } from '@angular/fire/auth';

import { AuthFirestoreService } from './auth-firestore.service';
import { DocumentSnapshot } from '@angular/fire/compat/firestore';

export abstract class UserFirestoreService extends AuthFirestoreService {
  readonly user$: Observable<User> = user(this.auth);

  readonly userId$: Observable<string> = this.user$.pipe(map((user) => user?.uid));

  override getCollection<T extends object>(path: string): Observable<T[]> {
    return this.userId$.pipe(switchMap((userId) => (userId ? super.getCollection<T>(`${path}/${userId}`) : of([]))));
  }

  override getDoc<T extends object>(path: string): Observable<DocumentSnapshot<T> | null> {
    return this.userId$.pipe(switchMap((userId) => (userId ? super.getDoc<T>(`${path}/${userId}`) : of(null))));
  }

  override updateDoc<T extends object>(path: string, data: T, add?: boolean): Observable<void> {
    return this.userId$.pipe(
      switchMap((userId) => (userId ? super.updateDoc<T>(`${path}/${userId}`, data, add) : of(undefined))),
    );
  }
}
