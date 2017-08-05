import { Observable, Subject } from 'rxjs';

export interface Credentials {
  username: string;
  password: string;
}

export const BLANK_CREDENTIALS: Credentials = { username: '', password: '' };

export type CommandBuffer<T> = Buffer;
export type CommandBufferWithMessage<T, TData> = Buffer;

export interface Command<TCode, TData = undefined> {
  id: string;
  code: TCode;
  message: TData;
}

export type OutgoingBufferWriter<T> = (id?: string, credentials?: Credentials) => CommandBuffer<T>;
export type OutgoingBufferWriterWithMessage<T, TData> = (data: TData, id?: string, credentials?: Credentials) => CommandBufferWithMessage<T, TData>;

export type IncomingBufferReader<TCode> = (buffer: Buffer) => Command<TCode>;
export type IncomingBufferReaderWithMessage<TCode, TData> = (buffer: Buffer) => Command<TCode, TData>;

export type CommandSubjectFactory = (write$: Subject<Buffer>, defaultCredentials?: Credentials) => CommandSubject;
export type CommandSubjectWithDataFactory<TData> = (write$: Subject<Buffer>, defaultCredentials?: Credentials) => CommandSubjectWithData<TData>;

export type CommandSubject = (id?: string, credentials?: Credentials) => void;
export type CommandSubjectWithData<TData> = (data: TData, id?: string, credentials?: Credentials) => void;

export type CommandObservableFactory<TCode> = (data$: Observable<Buffer>) => CommandObservable<TCode>;
export type CommandObservableWithDataFactory<TCode, TData> = (data$: Observable<Buffer>) => CommandObservableWithData<TCode, TData>;

export type CommandObservable<TCode> = Observable<Command<TCode>>;
export type CommandObservableWithData<TCode, TData> = Observable<Command<TCode, TData>>;
