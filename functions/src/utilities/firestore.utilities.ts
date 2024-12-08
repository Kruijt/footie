import { getFirestore } from 'firebase-admin/firestore';

export async function getDoc<T>(path: string): Promise<T | undefined> {
  return (await getFirestore().doc(path).get()).data() as T | undefined;
}
