// @ts-ignore
import { Observable } from 'rxjs/Observable';

import { default as ES } from 'esproto';

// @ts-ignore
import { Client, Config, Credentials, Event, PromiseType, connect } from 'rx-eventstore-streams';

import { catchup } from './catchup';
import * as request from './request';

export const partialClient = async (config: Config) => {
  const adapter = await connect(config);
  return {
    adapter,

    transactionStart: request.one<ES.ITransactionStart, ES.ITransactionStartCompleted>(adapter)('TransactionStart', 'TransactionStartCompleted'),
    transactionWrite: request.one<ES.ITransactionWrite, ES.ITransactionWriteCompleted>(adapter)('TransactionWrite', 'TransactionWriteCompleted'),
    transactionCommit: request.one<ES.ITransactionCommit, ES.ITransactionCommitCompleted>(adapter)('TransactionCommit', 'TransactionCommitCompleted'),

    createPersistentSubscription: request.one<ES.ICreatePersistentSubscription, ES.ICreatePersistentSubscriptionCompleted>(adapter)('CreatePersistentSubscription', 'CreatePersistentSubscriptionCompleted'),
    updatePersistentSubscription: request.one<ES.IUpdatePersistentSubscription, ES.IUpdatePersistentSubscriptionCompleted>(adapter)('UpdatePersistentSubscription', 'UpdatePersistentSubscriptionCompleted'),
    connectToPersistentSubscription: request.oneAndOngoing<ES.IConnectToPersistentSubscription, ES.IPersistentSubscriptionConfirmation, ES.IPersistentSubscriptionStreamEventAppeared>(adapter)('ConnectToPersistentSubscription', 'PersistentSubscriptionConfirmation', 'PersistentSubscriptionStreamEventAppeared'),
    persistentSubscriptionAckEvents: request.empty<ES.IPersistentSubscriptionAckEvents>(adapter)('PersistentSubscriptionAckEvents'),
    persistentSubscriptionNakEvents: request.empty<ES.IPersistentSubscriptionNakEvents>(adapter)('PersistentSubscriptionNakEvents'),
    deletePersistentSubscription: request.one<ES.IDeletePersistentSubscription, ES.IDeletePersistentSubscriptionCompleted>(adapter)('DeletePersistentSubscription', 'DeletePersistentSubscriptionCompleted'),

    subscribeToStream: request.oneAndOngoing<ES.ISubscribeToStream, ES.ISubscriptionConfirmation, ES.IStreamEventAppeared>(adapter)('SubscribeToStream', 'SubscriptionConfirmation', 'StreamEventAppeared'),
    unsubscribeFromStream: request.oneOptional<ES.IUnsubscribeFromStream, ES.ISubscriptionDropped>(adapter)('UnsubscribeFromStream', 'SubscriptionDropped'),

    readEvent: request.one<ES.IReadEvent, ES.IReadEventCompleted>(adapter)('ReadEvent', 'ReadEventCompleted'),
    writeEvents: request.one<ES.IWriteEvents, ES.IWriteEventsCompleted>(adapter)('WriteEvents', 'WriteEventsCompleted'),
    readStreamEventsForward: request.one<ES.IReadStreamEvents, ES.IReadStreamEventsCompleted>(adapter)('ReadStreamEventsForward', 'ReadStreamEventsForwardCompleted'),
    readStreamEventsBackward: request.one<ES.IReadStreamEvents, ES.IReadStreamEventsCompleted>(adapter)('ReadStreamEventsBackward', 'ReadStreamEventsBackwardCompleted'),
    readAllEventsForward: request.one<ES.IReadAllEvents, ES.IReadAllEventsCompleted>(adapter)('ReadAllEventsForward', 'ReadAllEventsForwardCompleted'),
    readAllEventsBackward: request.one<ES.IReadAllEvents, ES.IReadAllEventsCompleted>(adapter)('ReadAllEventsBackward', 'ReadAllEventsBackwardCompleted'),
    deleteStream: request.one<ES.IDeleteStream, ES.IDeleteStreamCompleted>(adapter)('DeleteStream', 'DeleteStreamCompleted'),

    authenticate: request.empty<void>(adapter)('Authenticate'),
    heartbeatResponseCommand: request.empty<void>(adapter)('HeartbeatResponseCommand'),
    identifyClient: request.one<ES.IIdentifyClient, ES.IClientIdentified>(adapter)('IdentifyClient', 'ClientIdentified'),
    ping: request.empty<void>(adapter)('Ping'),
    scavengeDatabase: request.one<ES.IScavengeDatabase, ES.IScavengeDatabaseCompleted>(adapter)('ScavengeDatabase', 'ScavengeDatabaseCompleted'),
  };
};

const client = async (config: Config) => {
  const c = await partialClient(config);
  return { ...c, catchup: catchup(c) };
};

export type PartialClient = PromiseType<ReturnType<typeof partialClient>>;
export type EsClient = PromiseType<ReturnType<typeof client>>;
export default client;
