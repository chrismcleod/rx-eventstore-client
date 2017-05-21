import EventStore from "../eventstore";

export enum CODES {
  HeartbeatRequestCommand = 0x01,
  HeartbeatResponseCommand = 0x02,
  Ping = 0x03,
  Pong = 0x04,
  PrepareAck = 0x05,
  CommitAck = 0x06,
  SlaveAssignment = 0x07,
  CloneAssignment = 0x08,
  SubscribeReplica = 0x10,
  ReplicaLogPositionAck = 0x11,
  CreateChunk = 0x12,
  RawChunkBulk = 0x13,
  DataChunkBulk = 0x14,
  ReplicaSubscriptionRetry = 0x15,
  ReplicaSubscribed = 0x16,
  WriteEvents = 0x82,
  WriteEventsCompleted = 0x83,
  TransactionStart = 0x84,
  TransactionStartCompleted = 0x85,
  TransactionWrite = 0x86,
  TransactionWriteCompleted = 0x87,
  TransactionCommit = 0x88,
  TransactionCommitCompleted = 0x89,
  DeleteStream = 0x8A,
  DeleteStreamCompleted = 0x8B,
  ReadEvent = 0xB0,
  ReadEventCompleted = 0xB1,
  ReadStreamEventsForward = 0xB2,
  ReadStreamEventsForwardCompleted = 0xB3,
  ReadStreamEventsBackward = 0xB4,
  ReadStreamEventsBackwardCompleted = 0xB5,
  ReadAllEventsForward = 0xB6,
  ReadAllEventsForwardCompleted = 0xB7,
  ReadAllEventsBackward = 0xB8,
  ReadAllEventsBackwardCompleted = 0xB9,
  SubscribeToStream = 0xC0,
  SubscriptionConfirmation = 0xC1,
  StreamEventAppeared = 0xC2,
  UnsubscribeFromStream = 0xC3,
  SubscriptionDropped = 0xC4,
  ConnectToPersistentSubscription = 0xC5,
  PersistentSubscriptionConfirmation = 0xC6,
  PersistentSubscriptionStreamEventAppeared = 0xC7,
  CreatePersistentSubscription = 0xC8,
  CreatePersistentSubscriptionCompleted = 0xC9,
  DeletePersistentSubscription = 0xCA,
  DeletePersistentSubscriptionCompleted = 0xCB,
  PersistentSubscriptionAckEvents = 0xCC,
  PersistentSubscriptionNakEvents = 0xCD,
  UpdatePersistentSubscription = 0xCE,
  UpdatePersistentSubscriptionCompleted = 0xCF,
  ScavengeDatabase = 0xD0,
  ScavengeDatabaseCompleted = 0xD1,
  BadRequest = 0xF0,
  NotHandled = 0xF1,
  Authenticate = 0xF2,
  Authenticated = 0xF3,
  NotAuthenticated = 0xF4,
  IdentifyClient = 0xF5,
  ClientIdentified = 0xF6
}

const MESSAGES = {

  [ CODES.WriteEvents ]: EventStore.WriteEvents,
  [ CODES.WriteEventsCompleted ]: EventStore.WriteEventsCompleted,

  [ CODES.TransactionStart ]: EventStore.TransactionStart,
  [ CODES.TransactionStartCompleted ]: EventStore.TransactionStartCompleted,
  [ CODES.TransactionWrite ]: EventStore.TransactionWrite,
  [ CODES.TransactionWriteCompleted ]: EventStore.TransactionWriteCompleted,
  [ CODES.TransactionCommit ]: EventStore.TransactionCommit,
  [ CODES.TransactionCommitCompleted ]: EventStore.TransactionCommitCompleted,

  [ CODES.DeleteStream ]: EventStore.DeleteStream,
  [ CODES.DeleteStreamCompleted ]: EventStore.DeleteStreamCompleted,

  [ CODES.ReadEvent ]: EventStore.ReadEvent,
  [ CODES.ReadEventCompleted ]: EventStore.ReadEventCompleted,
  [ CODES.ReadStreamEventsForward ]: EventStore.ReadStreamEvents,
  [ CODES.ReadStreamEventsForwardCompleted ]: EventStore.ReadStreamEventsCompleted,
  [ CODES.ReadStreamEventsBackward ]: EventStore.ReadStreamEvents,
  [ CODES.ReadStreamEventsBackwardCompleted ]: EventStore.ReadStreamEventsCompleted,
  [ CODES.ReadAllEventsForward ]: EventStore.ReadAllEvents,
  [ CODES.ReadAllEventsForwardCompleted ]: EventStore.ReadAllEventsCompleted,
  [ CODES.ReadAllEventsBackward ]: EventStore.ReadAllEvents,
  [ CODES.ReadAllEventsBackwardCompleted ]: EventStore.ReadAllEventsCompleted,

  [ CODES.SubscribeToStream ]: EventStore.SubscribeToStream,
  [ CODES.SubscriptionConfirmation ]: EventStore.SubscriptionConfirmation,
  [ CODES.StreamEventAppeared ]: EventStore.StreamEventAppeared,
  [ CODES.UnsubscribeFromStream ]: EventStore.UnsubscribeFromStream,
  [ CODES.SubscriptionDropped ]: EventStore.SubscriptionDropped,
  [ CODES.ConnectToPersistentSubscription ]: EventStore.ConnectToPersistentSubscription,
  [ CODES.PersistentSubscriptionConfirmation ]: EventStore.PersistentSubscriptionConfirmation,
  [ CODES.PersistentSubscriptionStreamEventAppeared ]: EventStore.PersistentSubscriptionStreamEventAppeared,
  [ CODES.CreatePersistentSubscription ]: EventStore.CreatePersistentSubscription,
  [ CODES.CreatePersistentSubscriptionCompleted ]: EventStore.CreatePersistentSubscriptionCompleted,
  [ CODES.DeletePersistentSubscription ]: EventStore.DeletePersistentSubscription,
  [ CODES.DeletePersistentSubscriptionCompleted ]: EventStore.DeletePersistentSubscriptionCompleted,
  [ CODES.PersistentSubscriptionAckEvents ]: EventStore.PersistentSubscriptionAckEvents,
  [ CODES.PersistentSubscriptionNakEvents ]: EventStore.PersistentSubscriptionNakEvents,
  [ CODES.UpdatePersistentSubscription ]: EventStore.UpdatePersistentSubscription,
  [ CODES.UpdatePersistentSubscriptionCompleted ]: EventStore.UpdatePersistentSubscriptionCompleted,

  [ CODES.ScavengeDatabase ]: EventStore.ScavengeDatabase,
  [ CODES.ScavengeDatabaseCompleted ]: EventStore.ScavengeDatabaseCompleted,

  [ CODES.NotHandled ]: EventStore.NotHandled
}

export function getMessage(code: number) {
  return <any>MESSAGES[ code ];
};
