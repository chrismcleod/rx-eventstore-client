import * as Commands from "../command";

import { Credentials } from "../authentication";
import { Socket } from "net";
import { TCPPackage } from "./tcp-package";

export class TCPDispatcher {

  private _credentials?: Credentials;
  private _promises: { [ key: string ]: ResolverRejector<Commands.Command<any>> };
  private _socket: Socket;

  constructor(socket: Socket, credentials?: Credentials) {
    this._credentials = credentials;
    this._promises = {};
    this._socket = socket;
  }

  public async dispatch(command: Commands.WriteEvents.Command): Promise<Commands.WriteEventsCompleted.Command>;
  public async dispatch(command: Commands.ReadStreamEventsBackward.Command): Promise<Commands.ReadStreamEventsBackwardCompleted.Command>;
  public async dispatch(command: Commands.ReadStreamEventsForward.Command): Promise<Commands.ReadStreamEventsForwardCompleted.Command>;
  public async dispatch(command: Commands.ReadAllEventsBackward.Command): Promise<Commands.ReadAllEventsBackwardCompleted.Command>;
  public async dispatch(command: Commands.ReadAllEventsForward.Command): Promise<Commands.ReadAllEventsForwardCompleted.Command>;
  public async dispatch(command: Commands.SubscribeToStream.Command): Promise<Commands.SubscriptionConfirmation.Command | Commands.SubscriptionDropped.Command>;
  public async dispatch(command: Commands.TransactionCommit.Command): Promise<Commands.TransactionCommitCompleted.Command>;
  public async dispatch(command: Commands.TransactionStart.Command): Promise<Commands.TransactionStartCompleted.Command>;
  public async dispatch(command: Commands.TransactionWrite.Command): Promise<Commands.TransactionWriteCompleted.Command>;
  public async dispatch(command: Commands.UnsubscribeFromStream.Command): Promise<Commands.SubscriptionDropped.Command>;
  public async dispatch(command: any): Promise<any> {
    const instance = this;
    return new Promise((resolve, reject) => {
      try {
        this._promises[ command.key ] = { resolve, reject };
        const tcpPackage = this.encode(command);
        const buffer = tcpPackage.toBuffer();
        instance._socket.write(buffer);
      } catch (err) {
        reject(err);
      }
    });
  }

  public encode(command: any) {
    return new TCPPackage({
      code: command.id,
      correlationId: command.correlationId,
      credentials: this._credentials,
      flag: this._credentials ? 1 : 0,
      message: command.encoded
    });
  }

  public complete(command: Commands.Command<any>) {
    const resolverRejector = this._promises[ command.key ];
    if (resolverRejector) resolverRejector.resolve(command);
  }

}
