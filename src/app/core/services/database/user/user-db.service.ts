import { map, Observable, shareReplay } from 'rxjs';

import { Injectable } from '@angular/core';

import { UserFirestoreService } from '../core/firestore/user/user-firestore.service';
import { User } from '../../../../shared/models/user.models';

@Injectable({
  providedIn: 'root',
})
export class UserDbService extends UserFirestoreService {
  readonly userData$: Observable<User | null> = this.getDoc<User>(`users`).pipe(
    map((data) => data?.data() || null),
    shareReplay(1),
  );

  setUser(user: User) {
    return this.updateDoc('users', user, true);
  }

  updateUser(update: Partial<User>) {
    return this.updateDoc('users', update);
  }
}

//rules_version = '2';
//
// service cloud.firestore {
//   match /databases/{database}/documents {
//     function isSignedIn() {
//       return request.auth && request.auth.uid != null;
//     }
//
//     match /teams/{teamId} {
//       allow read: if isSignedIn() && get(/users/$(request.auth.uid)/team) == teamId;
//       allow write: if isSignedIn() && get(/teams/$(teamId)/rights/$(request.auth.uid)) >= get(/rights/teamAdmin/value);
//     }
//
//     match /users/{userId} {
//       allow read: if isSignedIn() && get(/users/$(request.auth.uid)/team) == request.resource.data.team;
//       allow write: if isSignedIn() && request.auth.uid == userId;
//     }
//
//     match /rights/{rightId} {
//       allow read;
//     }
//
//     match /{document=**} {
//       allow read, write: if false;
//     }
//   }
// }
