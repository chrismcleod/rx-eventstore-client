import { Observable, Scheduler, Subject } from 'rxjs';
import { curry, has, last, when } from 'ramda';

interface BufferAccumulation {
  buffers: Buffer[];
  currentSize: number;
  nextPackageSize: number;
}

interface BufferPackage {
  buffer: Buffer;
  extra?: Buffer;
}

const toAccumulateBuffers = (accumulatedResult: BufferAccumulation, incomingBuffer: Buffer) => {
  accumulatedResult.buffers.push(incomingBuffer);
  accumulatedResult.currentSize += incomingBuffer.byteLength;
  return accumulatedResult;
};

const packageIsIncomplete = (accumulatedResult: BufferAccumulation) => accumulatedResult.currentSize < accumulatedResult.nextPackageSize;

const toPotentiallyOvercompletedBuffer = (accumulatedResult: BufferAccumulation): BufferPackage => {
  const extraDataLength = accumulatedResult.currentSize - accumulatedResult.nextPackageSize;
  if (extraDataLength <= 0) {
    return {
      buffer: Buffer.concat(accumulatedResult.buffers)
    };
  }
  const lastBuffer = last(accumulatedResult.buffers);
  const lastSlice = lastBuffer.slice(0, lastBuffer.byteLength - extraDataLength);
  return {
    buffer: Buffer.concat([ ...accumulatedResult.buffers.slice(0, -1), lastSlice ]),
    extra: lastBuffer.slice(extraDataLength * -1)
  };
};

const toBufferAccumulationUntilPotentiallyOvercomplete = curry(
  (socket$: Observable<Buffer>, firstBuffer: Buffer) => socket$
    .startWith(firstBuffer)
    .scan(toAccumulateBuffers, { buffers: [] as Buffer[], currentSize: 0, nextPackageSize: firstBuffer.readUInt32LE(0) + 4 })
    .skipWhile(packageIsIncomplete)
    .map(toPotentiallyOvercompletedBuffer)
    .first()
);

const tryToEmitExtraOn = (extra$: Subject<Buffer>) => when(has('extra'), (bufferPackage: BufferPackage) => {
  return extra$.next(bufferPackage.extra);
});

const toJustFinalBuffer = (bufferPackage: BufferPackage) => bufferPackage.buffer;

const extra$ = new Subject<Buffer>();

const mergeSocket$WithExtra$ = (source$: Observable<Buffer>, callback: (merged$: Observable<Buffer>) => Observable<Buffer>) => callback(Observable.merge(source$, extra$).observeOn(Scheduler.queue));

export const data$ = (socket$: Observable<Buffer>) => mergeSocket$WithExtra$(socket$,
  (merged$) => merged$
    .exhaustMap(toBufferAccumulationUntilPotentiallyOvercomplete(merged$))
    .do(tryToEmitExtraOn(extra$))
    .map(toJustFinalBuffer)
);
