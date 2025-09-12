import md5 from 'md5';

import { getFirestore, WriteResult } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

import { FileMetadata, SaveOptions } from '@google-cloud/storage';

export async function getDoc<T>(path: string): Promise<T | undefined> {
  return (await getFirestore().doc(path).get()).data() as T | undefined;
}

export async function getCollection<T>(path: string): Promise<(T & { $id: string })[]> {
  const fs = getFirestore();

  return fs
    .collection(path)
    .get()
    .then((result) =>
      result.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            $id: doc.id,
          }) as T & { $id: string },
      ),
    );
}

export async function setCollection(path: string, data: { id: string }[]): Promise<WriteResult[]> {
  const fs = getFirestore();
  const batch = fs.batch();

  data.forEach((update) => batch.set(fs.doc(`${path}/${update.id}`), update));

  return batch.commit();
}

export async function storeFileWithCheck(
  path: string,
  data: string,
  options: SaveOptions = { contentType: 'application/json' },
): Promise<string | null> {
  const hash = md5(data);
  const { metadata } = await getFileMetaData(path);

  if (metadata?.hash !== hash) {
    const oldData = await getFile(path);

    await storeFile(path, data, { ...options, metadata: { metadata: { hash } } });

    return oldData;
  } else {
    return null;
  }
}

export async function storeFile(
  path: string,
  data: string,
  options: SaveOptions = { contentType: 'application/json' },
): Promise<void> {
  const file = getStorage().bucket().file(path);

  await file.save(data, options);
}

export async function getFile(path: string): Promise<string | null> {
  try {
    const file = getStorage().bucket().file(path);

    const exists = await file.exists();

    if (exists) {
      const data = await file.download();

      return data.toString();
    } else {
      return null;
    }
  } catch {
    return null;
  }
}

export async function getFileMetaData(path: string): Promise<FileMetadata> {
  try {
    const file = getStorage().bucket().file(path);

    const exists = await file.exists();

    if (exists) {
      const [metadata] = await file.getMetadata();

      return metadata;
    } else {
      return {};
    }
  } catch {
    return {};
  }
}

export function safeKey(key: string): string {
  const firebaseUnsafeChars = [
    '.',
    '$',
    '#',
    '[',
    ']',
    '/',
    '\\',
    ...Array.from(Array(32))
      .map((_, i) => i)
      .concat(127)
      .map((code) => String.fromCharCode(code)),
  ];

  return key
    .split('')
    .filter((char) => !firebaseUnsafeChars.includes(char))
    .map((char) => char.toLowerCase())
    .join('');
}
