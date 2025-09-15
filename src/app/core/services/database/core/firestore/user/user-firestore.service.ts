import { filter, map, Observable, of, switchMap, tap } from 'rxjs';

import { user, User } from '@angular/fire/auth';

import { AuthFirestoreService } from '../auth-firestore.service';
import { DocumentData, DocumentSnapshot } from '@angular/fire/firestore';

export abstract class UserFirestoreService extends AuthFirestoreService {
  readonly user$: Observable<User | null> = user(this.auth);

  readonly userId$: Observable<string | undefined> = this.user$.pipe(map((user) => user?.uid));

  override getCollection<T extends DocumentData>(path: string): Observable<T[]> {
    return this.userId$.pipe(
      filter((userId) => !!userId),
      switchMap((userId) => (userId ? super.getCollection<T>(`/${path}/${userId}`) : of([]))),
    );
  }

  override getDoc<T extends DocumentData>(path: string): Observable<DocumentSnapshot<T> | null> {
    return this.userId$.pipe(
      filter((userId) => !!userId),
      tap((userId) => console.log(`/${path}/${userId}`)),
      switchMap((userId) => super.getDoc<T>(`/${path}/${userId}`)),
    );
  }

  override updateDoc<T extends DocumentData>(path: string, data: T, add?: boolean): Observable<void> {
    return this.userId$.pipe(
      switchMap((userId) => (userId ? super.updateDoc<T>(`/${path}/${userId}`, data, add) : of(undefined))),
    );
  }
}
