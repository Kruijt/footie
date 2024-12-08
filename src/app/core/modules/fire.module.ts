import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';

export const fireProviders = [
  provideFirebaseApp(() =>
    initializeApp({
      projectId: 'footie-kruijt',
      appId: '1:510398286336:web:b2b744627efd83f657a6e5',
      storageBucket: 'footie-kruijt.appspot.com',
      apiKey: 'AIzaSyDAIEd7MXmPU1cgns6DFdobqnUVvW2EZDE',
      authDomain: 'footie-kruijt.firebaseapp.com',
      messagingSenderId: '510398286336',
    }),
  ),
  provideAuth(() => getAuth()),
  provideFirestore(() => getFirestore()),
  provideFunctions(() => getFunctions(undefined, 'europe-west1')),
];
