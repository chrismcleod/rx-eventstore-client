import * as eventstore from 'esproto';

import { CommandSubjectFactory, CommandSubjectWithDataFactory } from '../core';

export interface CommandSubjects {
  Authenticate: CommandSubjectFactory;
  CloneAssignment: CommandSubjectFactory;
  CommitAck: CommandSubjectFactory;
  ConnectToPersistentSubscription: CommandSubjectWithDataFactory<eventstore.ConnectToPersistentSubscription$Properties>;
  CreateChunk: CommandSubjectFactory;
  CreatePersistentSubscription: CommandSubjectWithDataFactory<eventstore.CreatePersistentSubscription$Properties>;
  DeletePersistentSubscription: CommandSubjectWithDataFactory<eventstore.DeletePersistentSubscription$Properties>;
  DeleteStream: CommandSubjectWithDataFactory<eventstore.DeleteStream$Properties>;
  HeartbeatResponseCommand: CommandSubjectFactory;
  IdentifyClient: CommandSubjectFactory;
  PersistentSubscriptionAckEvents: CommandSubjectWithDataFactory<eventstore.PersistentSubscriptionAckEvents$Properties>;
  PersistentSubscriptionNakEvents: CommandSubjectWithDataFactory<eventstore.PersistentSubscriptionNakEvents$Properties>;
  Ping: CommandSubjectFactory;
  PrepareAck: CommandSubjectFactory;
  RawChunkBulk: CommandSubjectFactory;
  ReadAllEventsBackward: CommandSubjectWithDataFactory<eventstore.ReadAllEventsBackward$Properties>;
  ReadAllEventsForward: CommandSubjectWithDataFactory<eventstore.ReadAllEventsForward$Properties>;
  ReadEvent: CommandSubjectWithDataFactory<eventstore.ReadEvent$Properties>;
  ReadStreamEventsBackward: CommandSubjectWithDataFactory<eventstore.ReadStreamEventsBackward$Properties>;
  ReadStreamEventsForward: CommandSubjectWithDataFactory<eventstore.ReadStreamEventsForward$Properties>;
  ReplicaLogPositionAck: CommandSubjectFactory;
  ReplicaSubscriptionRetry: CommandSubjectFactory;
  ScavengeDatabase: CommandSubjectWithDataFactory<eventstore.ScavengeDatabase$Properties>;
  SlaveAssignment: CommandSubjectFactory;
  SubscribeReplica: CommandSubjectFactory;
  SubscribeToStream: CommandSubjectWithDataFactory<eventstore.SubscribeToStream$Properties>;
  TransactionCommit: CommandSubjectWithDataFactory<eventstore.TransactionCommit$Properties>;
  TransactionStart: CommandSubjectWithDataFactory<eventstore.TransactionStart$Properties>;
  TransactionWrite: CommandSubjectWithDataFactory<eventstore.TransactionWrite$Properties>;
  UnsubscribeFromStream: CommandSubjectWithDataFactory<eventstore.UnsubscribeFromStream$Properties>;
  UpdatePersistentSubscription: CommandSubjectWithDataFactory<eventstore.UpdatePersistentSubscription$Properties>;
  WriteEvents: CommandSubjectWithDataFactory<eventstore.WriteEvents$Properties>;
}
