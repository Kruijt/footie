import { inject } from '@angular/core';
import { getBlob, ref, Storage } from '@angular/fire/storage';

export abstract class StorageService {
  readonly storage = inject(Storage);

  async getJSONFile<T extends object>(file: string): Promise<T> {
    const fileRef = await getBlob(ref(this.storage, file));
    return JSON.parse(await fileRef.text());
  }
}
