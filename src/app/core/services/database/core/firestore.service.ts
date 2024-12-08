import { from, Observable, shareReplay } from 'rxjs';

import { inject } from '@angular/core';

import { collection, collectionData, doc, docSnapshots, Firestore, updateDoc } from '@angular/fire/firestore';
import { DocumentSnapshot } from '@angular/fire/compat/firestore';
import { setDoc } from '@firebase/firestore';

export abstract class FirestoreService {
  readonly fs = inject(Firestore);

  getCollection<T extends object>(path: string): Observable<T[]> {
    return collectionData<T>(collection(this.fs, path)).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  getDoc<T extends object>(path: string): Observable<DocumentSnapshot<T> | null> {
    return docSnapshots<T>(doc(this.fs, path)).pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  updateDoc<T extends object>(path: string, data: T, add?: boolean): Observable<void> {
    const docRef = doc(this.fs, path);
    const command = add ? setDoc : updateDoc;

    return from(command(docRef, data));
  }
}
