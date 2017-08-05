import 'rxjs/add/operator/do';
import 'rxjs/add/operator/publishReplay';

import { Observable } from 'rxjs/Observable';

export type Backoff = number | ((attempt: number) => number);
export type WithId = { id: string };
export type BeforeRetry = <T>(value: T) => any;

export function incrementalRetry<T>(this: Observable<T>, timeout: number, retryCount = 3, backoff: Backoff, beforeRetry?: BeforeRetry): Observable<T> {
  if (typeof backoff === 'function') {
    if (beforeRetry) {
      return this
        .timeout(timeout)
        .retryWhen((attempts) => Observable.range(1, retryCount).zip(attempts, (i) => i).do(beforeRetry).switchMap((i) => Observable.timer(i * backoff(i))));
    }
    return this
      .timeout(timeout)
      .retryWhen((attempts) => Observable.range(1, retryCount).zip(attempts, (i) => i).switchMap((i) => Observable.timer(i * backoff(i))));
  }
  if (beforeRetry) {
    return this
      .map(beforeRetry)
      .timeout(timeout)
      .retryWhen((attempts) => Observable.range(1, retryCount).zip(attempts, (i) => i).do(beforeRetry).switchMap((i) => Observable.timer(i * backoff)));
  }
  return this
    .timeout(timeout)
    .retryWhen((attempts) => Observable.range(1, retryCount).zip(attempts, (i) => i).switchMap((i) => Observable.timer(i * backoff)));
}

export function forCommand<T extends WithId>(this: Observable<T>, id: string): Observable<T> {
  return this.filter((value) => value.id === id);
}

(Observable as any).prototype.incrementalRetry = incrementalRetry;
(Observable as any).prototype.forCommand = forCommand;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    incrementalRetry: typeof incrementalRetry;
    forCommand: typeof forCommand;
  }
}
