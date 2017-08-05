import * as eventstore from 'esproto';

import { OutgoingBufferWriter, OutgoingBufferWriterWithMessage } from '../core';

export interface OutgoingBufferWriters {
  Authenticate: OutgoingBufferWriter<eventstore.OutgoingCodes.Authenticate>;
  CloneAssignment: OutgoingBufferWriter<eventstore.OutgoingCodes.CloneAssignment>;
  CommitAck: OutgoingBufferWriter<eventstore.OutgoingCodes.CommitAck>;
  ConnectToPersistentSubscription: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.ConnectToPersistentSubscription, eventstore.ConnectToPersistentSubscription$Properties>;
  CreateChunk: OutgoingBufferWriter<eventstore.OutgoingCodes.CreateChunk>;
  CreatePersistentSubscription: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.CreatePersistentSubscription, eventstore.CreatePersistentSubscription$Properties>;
  DeletePersistentSubscription: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.DeletePersistentSubscription, eventstore.DeletePersistentSubscription$Properties>;
  DeleteStream: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.DeleteStream, eventstore.DeleteStream$Properties>;
  HeartbeatResponseCommand: OutgoingBufferWriter<eventstore.OutgoingCodes.HeartbeatResponseCommand>;
  IdentifyClient: OutgoingBufferWriter<eventstore.OutgoingCodes.IdentifyClient>;
  PersistentSubscriptionAckEvents: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.PersistentSubscriptionAckEvents, eventstore.PersistentSubscriptionAckEvents$Properties>;
  PersistentSubscriptionNakEvents: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.PersistentSubscriptionNakEvents, eventstore.PersistentSubscriptionNakEvents$Properties>;
  Ping: OutgoingBufferWriter<eventstore.OutgoingCodes.Ping>;
  PrepareAck: OutgoingBufferWriter<eventstore.OutgoingCodes.PrepareAck>;
  RawChunkBulk: OutgoingBufferWriter<eventstore.OutgoingCodes.RawChunkBulk>;
  ReadAllEventsBackward: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.ReadAllEventsBackward, eventstore.ReadAllEventsBackward$Properties>;
  ReadAllEventsForward: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.ReadAllEventsForward, eventstore.ReadAllEventsForward$Properties>;
  ReadEvent: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.ReadEvent, eventstore.ReadEvent$Properties>;
  ReadStreamEventsBackward: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.ReadStreamEventsBackward, eventstore.ReadStreamEventsBackward$Properties>;
  ReadStreamEventsForward: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.ReadStreamEventsForward, eventstore.ReadStreamEventsForward$Properties>;
  ReplicaLogPositionAck: OutgoingBufferWriter<eventstore.OutgoingCodes.ReplicaLogPositionAck>;
  ReplicaSubscriptionRetry: OutgoingBufferWriter<eventstore.OutgoingCodes.ReplicaSubscriptionRetry>;
  ScavengeDatabase: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.ScavengeDatabase, eventstore.ScavengeDatabase$Properties>;
  SlaveAssignment: OutgoingBufferWriter<eventstore.OutgoingCodes.SlaveAssignment>;
  SubscribeReplica: OutgoingBufferWriter<eventstore.OutgoingCodes.SubscribeReplica>;
  SubscribeToStream: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.SubscribeToStream, eventstore.SubscribeToStream$Properties>;
  TransactionCommit: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.TransactionCommit, eventstore.TransactionCommit$Properties>;
  TransactionStart: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.TransactionStart, eventstore.TransactionStart$Properties>;
  TransactionWrite: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.TransactionWrite, eventstore.TransactionWrite$Properties>;
  UnsubscribeFromStream: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.UnsubscribeFromStream, eventstore.UnsubscribeFromStream$Properties>;
  UpdatePersistentSubscription: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.UpdatePersistentSubscription, eventstore.UpdatePersistentSubscription$Properties>;
  WriteEvents: OutgoingBufferWriterWithMessage<eventstore.OutgoingCodes.WriteEvents, eventstore.WriteEvents$Properties>;
}
