import type { AuthData } from 'firebase-functions/lib/common/providers/https';
import type { CallableFunction, CallableRequest } from 'firebase-functions/v2/https';

export interface AuthenticatedCallableFunction<Request, Return> extends CallableFunction<Request, Return> {
  run(data: AuthenticatedCallableRequest<Request>): Return;
}

export interface AuthenticatedCallableRequest<Request> extends CallableRequest<Request> {
  auth: AuthData;
}
