import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

import { FirestoreService } from './firestore.service';

export abstract class AuthFirestoreService extends FirestoreService {
  readonly auth: Auth = inject(Auth);
}
