import { Observable } from 'rxjs/Observable';
import { v4 } from 'uuid';

import { lookupCode } from 'esproto';
import { Client, Command, Credentials, Event } from 'rx-eventstore-streams';

export const ongoing = <TData, TResponse = any>(client: Client) =>
  (outgoingCommandName: string, incomingCommandName: string) =>
    (data: TData, correlationId?: string, credentials?: Credentials) => {
      const code = lookupCode(outgoingCommandName);
      const responseCode = lookupCode(incomingCommandName);
      const corId = correlationId || v4();
      const command: Command = { code, credentials, data, correlationId: corId };
      let response: Observable<Event<TResponse>>;
      response = client.$.filter(event => event.code === responseCode && event.correlationId === corId);
      process.nextTick(() => client.send(command));
      return response.share();
    };

export const one = <TData, TResponse = any>(client: Client) =>
  (outgoingCommandName: string, incomingCommandName: string) =>
    (data: TData, correlationId?: string, credentials?: Credentials) => {
      const code = lookupCode(outgoingCommandName);
      const responseCode = lookupCode(incomingCommandName);
      const corId = correlationId || v4();
      const command: Command = { code, credentials, data, correlationId: corId };
      let response: Observable<Event<TResponse>>;
      response = client.$.first(event => event.code === responseCode && event.correlationId === corId);
      process.nextTick(() => client.send(command));
      return response.share();
    };

export const oneOptional = <TData, TResponse = any>(client: Client) =>
  (outgoingCommandName: string, incomingCommandName: string) =>
    (data?: TData, correlationId?: string, credentials?: Credentials) => {
      const code = lookupCode(outgoingCommandName);
      const responseCode = lookupCode(incomingCommandName);
      const corId = correlationId || v4();
      const command: Command = { code, credentials, data, correlationId: corId };
      let response: Observable<Event<TResponse>>;
      response = client.$.first(event => event.code === responseCode && event.correlationId === corId);
      process.nextTick(() => client.send(command));
      return response.share();
    };

export const oneAndOngoing = <TData, TComplete, TOngoing>(client: Client) =>
  (outgoingCommandName: string, completeCommandName: string, ongoingCommandName: string) =>
    (data: TData, correlationId?: string, credentials?: Credentials) => {
      const outgoingCode = lookupCode(outgoingCommandName);
      const completeCode = lookupCode(completeCommandName);
      const ongoingCode = lookupCode(ongoingCommandName);
      const corId = correlationId || v4();
      const command: Command = { credentials, data, code: outgoingCode, correlationId: corId };
      let completionStream: Observable<Event<TComplete>>;
      let ongoingStream: Observable<Event<TOngoing>>;
      completionStream = client.$.first(event => event.code === completeCode && event.correlationId === corId);
      ongoingStream = client.$.filter(event => event.code === ongoingCode && event.correlationId === corId);
      process.nextTick(() => client.send(command));
      return { onComplete: completionStream.share(), onEvent: ongoingStream.share() };
    };

export const empty = <TData>(client: Client) =>
  (code: string) =>
    (data: TData, correlationId?: string, credentials?: Credentials) => {
      const command: Command = { correlationId, credentials, data, code: lookupCode(code) };
      return Observable.of(client.send(command));
    };
