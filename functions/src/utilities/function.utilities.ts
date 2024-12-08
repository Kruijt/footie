import { App, initializeApp } from 'firebase-admin/app';
import { CallableRequest, onCall } from 'firebase-functions/v2/https';
import type { CallableFunction, CallableOptions } from 'firebase-functions/lib/v2/providers/https';
import type { AuthenticatedCallableFunction, AuthenticatedCallableRequest } from '../models/function.models';

let app: App;

export function initCallFunction<Request, Response>(
  requestHandler: (request: CallableRequest<Request>) => Promise<Response>,
  options: CallableOptions,
): CallableFunction<Request, Promise<Response>> {
  return onCall<Request, Promise<Response>>(
    {
      region: 'europe-west1',
      cors: true,
      ...options,
    },
    requestHandler,
  );
}

export function initAuthDbFunction<Request, Response>(
  requestHandler: (request: AuthenticatedCallableRequest<Request>) => Promise<Response>,
): AuthenticatedCallableFunction<Request, Promise<Response>> {
  const authRequestHandler = (request: CallableRequest<Request>) => {
    if (!request.auth?.uid) {
      throw new Error('Unauthorized');
    }

    app ||= initializeApp();

    return requestHandler(request as AuthenticatedCallableRequest<Request>);
  };

  return initCallFunction<Request, Response>(authRequestHandler, {
    invoker: 'private',
  });
}
