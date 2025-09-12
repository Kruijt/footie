import { from, map, Observable, shareReplay } from 'rxjs';

import { inject } from '@angular/core';

import { setDoc } from '@firebase/firestore';
import {
  collection,
  collectionData,
  doc,
  docSnapshots,
  DocumentData,
  DocumentSnapshot,
  Firestore,
  updateDoc,
} from '@angular/fire/firestore';

export abstract class FirestoreService {
  readonly fs = inject(Firestore);

  getCollection<T extends DocumentData>(path: string): Observable<T[]> {
    return collectionData(collection(this.fs, path)).pipe(
      map((data) => (Array.isArray(data) ? data : []) as T[]),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  getDoc<T extends DocumentData>(path: string): Observable<DocumentSnapshot<T> | null> {
    return docSnapshots(doc(this.fs, path)).pipe(
      map((snapshot) => (snapshot.exists() ? (snapshot as DocumentSnapshot<T>) : null)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  updateDoc<T extends object>(path: string, data: T, add?: boolean): Observable<void> {
    const docRef = doc(this.fs, path);

    const command = add ? setDoc : updateDoc;

    return from(command(docRef, data));
  }
}
