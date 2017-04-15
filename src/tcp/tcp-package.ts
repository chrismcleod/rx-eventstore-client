import { Credentials } from "./../authentication";

export const FLAGS_NONE = 0x00;
export const FLAGS_AUTH = 0x01;

export const UINT32_LENGTH = 4;
export const GUID_LENGTH = 16;
export const HEADER_LENGTH = 1 + 1 + GUID_LENGTH; // Cmd + Flags + CorrelationId

export const COMMAND_OFFSET = UINT32_LENGTH;
export const FLAGS_OFFSET = COMMAND_OFFSET + 1;
export const CORRELATION_ID_OFFSET = FLAGS_OFFSET + 1;
export const DATA_OFFSET = CORRELATION_ID_OFFSET + GUID_LENGTH;

export interface TCPPackageParams {
  code: number;
  correlationId: string;
  credentials?: Credentials;
  flag: number;
  message?: Buffer;
}

/**
 * The TCPPackage looks like:
 * +------------------------------------------------------+
 * |  A  |  B  |  C  |        D        |        E         |
 * +------------------------------------------------------+
 * |                                                      |
 * |                          F                           |
 * |                                                      |
 * +------------------------------------------------------+
 * A = Command Length        bytes  00-03 (UInt32 LE)
 * B = Command Code          byte      04 (UInt8)
 * C = Has Auth Flag         byte      05 (UInt8)
 * D = Correlation Id        bytes  06-21
 * E = Optional Credentials  bytes  22-xx
 * F = Protocol Buffer       bytes  (22 || xx+1)-yy
 */
export class TCPPackage {

  public static fromBuffer(buffer: Buffer): TCPPackage {

    const commandLength = buffer.readUInt32LE(0);
    const code = buffer[COMMAND_OFFSET];

    if (commandLength < HEADER_LENGTH) {
      throw new TypeError(`Invalid buffer size ${commandLength}`);
    }

    const flag = buffer[FLAGS_OFFSET];
    const correlationId = buffer.toString("hex", CORRELATION_ID_OFFSET, CORRELATION_ID_OFFSET + GUID_LENGTH);

    const messageLength = commandLength - HEADER_LENGTH;
    const message = Buffer.alloc(messageLength);
    if (messageLength > 0) {
      buffer.copy(message, 0, DATA_OFFSET, DATA_OFFSET + messageLength);
    }

    return new TCPPackage({
      code,
      correlationId,
      flag,
      message
    });

  }

  public code: number;
  public correlationId: string;
  public correlationIdBuffer: Buffer;
  public credentials?: Credentials;
  public flag: number;
  public message?: Buffer;

  private _usernameLength: number = 0;
  private _passwordLength: number = 0;
  private _credentialsLength: number = 0;
  private _messageLength: number = 0;
  private _commandLength: number = HEADER_LENGTH;

  constructor(params: TCPPackageParams) {
    Object.assign(this, params);
    this.correlationIdBuffer = Buffer.from(this.correlationId.replace(/-/g, ""), "hex");
    if (this.credentials) {
      this._usernameLength = Buffer.byteLength(this.credentials.username, "utf8");
      this._passwordLength = Buffer.byteLength(this.credentials.password, "utf8");
      if (this._usernameLength > 255) {
        throw new TypeError(`Username must be less than 256 bytes`);
      }
      if (this._passwordLength > 255) {
        throw new TypeError(`Password must be less than 256 bytes`);
      }
      this._credentialsLength = this._usernameLength + this._passwordLength + 2;
    }
    this._messageLength = this.message ? this.message.byteLength : 0;
    this._commandLength = HEADER_LENGTH + this._credentialsLength + this._messageLength;
  }

  public toBuffer() {
    const buffer = Buffer.alloc(this._commandLength + 4);
    buffer.writeUInt32LE(this._commandLength, 0);
    buffer[COMMAND_OFFSET] = this.code;
    buffer[FLAGS_OFFSET] = this.flag;

    this.correlationIdBuffer.copy(
      buffer, CORRELATION_ID_OFFSET,
      0, GUID_LENGTH
    );

    if (this.credentials) {
      buffer.writeUInt8(this._usernameLength, DATA_OFFSET);
      buffer.write(this.credentials.username, DATA_OFFSET + 1);
      buffer.writeUInt8(this._passwordLength, DATA_OFFSET + 1 + this._usernameLength);
      buffer.write(this.credentials.password, DATA_OFFSET + 1 + this._usernameLength + 1);
    }

    if (this.message) {
      this.message.copy(
        buffer, DATA_OFFSET + this._credentialsLength,
        0, this._messageLength
      );
    }

    return buffer;
  }

}
