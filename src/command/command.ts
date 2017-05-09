export interface Command<TCode extends number = number, TMessage = any> {
  id: TCode;
  key: string;
  correlationId: string;
  message: TMessage;
  encoded: Buffer;
}

export class Position {

  public static Exact(position: Long | number) {
    return new Position(position, position);
  }

  public static get Last() {
    return new Position(-1, -1);
  }

  public static get First() {
    return Position.Exact(0);
  }

  public commit: Long | number;
  public prepare: Long | number;

  constructor(commit: Long | number, prepare: Long | number) {
    this.commit = commit;
    this.prepare = prepare;
  }
}
