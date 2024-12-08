import { inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';

import { connectFunctionsEmulator, HttpsCallableResult } from '@firebase/functions';

import { environment } from '../../../../../environments/environment';

export abstract class FunctionsService {
  readonly f = inject(Functions);

  protected constructor() {
    if (!environment.production) {
      connectFunctionsEmulator(this.f, '127.0.0.1', 5001);
    }
  }

  callFunction<RequestData = unknown, ResponseData = unknown>(
    name: string,
    data: RequestData,
  ): Promise<HttpsCallableResult<ResponseData>> {
    return httpsCallable<RequestData, ResponseData>(this.f, name)(data);
  }
}
