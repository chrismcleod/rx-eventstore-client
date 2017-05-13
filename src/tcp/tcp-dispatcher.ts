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

  public async dispatch(command: Commands.Authenticate.Command): Promise<Commands.NotAuthenticated.Command | Commands.Authenticated.Command>;
  public async dispatch(command: Commands.DeleteStream.Command): Promise<Commands.DeleteStreamCompleted.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
  public async dispatch(command: Commands.ReadAllEventsBackward.Command): Promise<Commands.ReadAllEventsBackwardCompleted.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
  public async dispatch(command: Commands.ReadAllEventsForward.Command): Promise<Commands.ReadAllEventsForwardCompleted.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
  public async dispatch(command: Commands.ReadEvent.Command): Promise<Commands.ReadEventCompleted.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
  public async dispatch(command: Commands.ReadStreamEventsBackward.Command): Promise<Commands.ReadStreamEventsBackwardCompleted.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
  public async dispatch(command: Commands.ReadStreamEventsForward.Command): Promise<Commands.ReadStreamEventsForwardCompleted.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
  public async dispatch(command: Commands.SubscribeToStream.Command): Promise<Commands.SubscriptionConfirmation.Command | Commands.SubscriptionDropped.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
  public async dispatch(command: Commands.TransactionCommit.Command): Promise<Commands.TransactionCommitCompleted.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
  public async dispatch(command: Commands.TransactionStart.Command): Promise<Commands.TransactionStartCompleted.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
  public async dispatch(command: Commands.TransactionWrite.Command): Promise<Commands.TransactionWriteCompleted.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
  public async dispatch(command: Commands.UnsubscribeFromStream.Command): Promise<Commands.SubscriptionDropped.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
  public async dispatch(command: Commands.WriteEvents.Command): Promise<Commands.WriteEventsCompleted.Command | Commands.NotHandled.Command | Commands.NotAuthenticated.Command>;
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
