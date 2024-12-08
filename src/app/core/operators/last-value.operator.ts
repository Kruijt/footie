import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

export function lastValue<T>(source: Observable<T>, fallback?: T): T | undefined {
  let value: T | undefined = undefined;

  source.pipe(take(1)).subscribe((v) => (value = v));

  return value != null ? value : fallback != null ? fallback : void 0;
}
