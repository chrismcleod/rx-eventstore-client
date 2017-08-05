import * as crypto from 'crypto';

const B = Math.pow(2, 3);
const KB = Math.pow(2, 10);
const MB = Math.pow(2, 20);
const GB = Math.pow(2, 30);
const TB = Math.pow(2, 40);

type ByteScale = 'B' | 'KB' | 'MB' | 'GB' | 'TB';
const SIZES: { [ key: string ]: number } = { B, KB, MB, GB, TB };

type WriteType =
  | 'write'
  | 'writeUIntLE'
  | 'writeUIntBE'
  | 'writeIntLE'
  | 'writeIntBE'
  | 'writeUInt8'
  | 'writeUInt16LE'
  | 'writeUInt16BE'
  | 'writeUInt32LE'
  | 'writeUInt32BE'
  | 'writeInt8'
  | 'writeInt16LE'
  | 'writeInt16BE'
  | 'writeInt32LE'
  | 'writeInt32BE'
  | 'writeFloatLE'
  | 'writeFloatBE'
  | 'writeDoubleLE'
  | 'writeDoubleBE';

export const getActualSize = (size: string) => {
  const [ bytes, multiplier ] = [ parseInt(size.replace(/[^\d]/g, ''), 10), size.replace(/\d/g, '') ];
  return bytes * SIZES[ multiplier ];
};

export const makeBuffer = (size: string, options?: { data: any, startingOffset?: number, writeType?: WriteType }) => {
  const actualSize = getActualSize(size);
  const buffer = Buffer.alloc(actualSize);
  crypto.randomFillSync(buffer);
  const writeType = options && options.writeType ? options.writeType : 'write';
  if (options && options.data) {
    (buffer as any)[ writeType ](options.data, options.startingOffset || 0);
  }
  return buffer;
};

export const segmentBuffer = (segments: number, buffer: Buffer, segmentLengths: number[] = [ B ]) => {
  const buffers: Buffer[] = [];
  for (let i = 0; i < segments; ++i) {
    const j = i % segmentLengths.length;
    let k = (i - 1) % segmentLengths.length;
    if (k <= 0) {
      k = 0;
    }
    const length = segmentLengths[ j ];
    const prevLength = i === 0 ? 0 : segmentLengths[ k ];
    buffers.push(buffer.slice(prevLength * i, length * (i + 1)));
  }
  return buffers;
};

export const spreadBuffers = (segments: number, buffers: Buffer[]) => {
  const buffer = Buffer.concat(buffers);
  const bytesPerSegment = Math.ceil(buffer.byteLength / segments);
  const finalBuffers: Buffer[] = [];
  for (let i = 0; i < segments; ++i) {
    finalBuffers.push(buffer.slice(i * bytesPerSegment, (i + 1) * bytesPerSegment));
  }
  return finalBuffers;
};

export const esBuffers = (count: number, segments = 1, codes: number[] = [ 1 ], scale: ByteScale = 'KB', sizes?: number[]) => {
  const spread: Buffer[] = [];
  const original: Buffer[] = [];
  for (let i = 0; i < count; ++i) {
    const size = sizes ? sizes[ i % sizes.length ] : 1 + Math.round(Math.random() * 9);
    const actualSize = getActualSize(`${size}${scale}`);
    const buffer = makeBuffer(`${size}${scale}`, { data: actualSize - 4, startingOffset: 0, writeType: 'writeUInt32LE' });
    original.push(buffer);
    buffer.writeUInt8(codes[ i % codes.length ], 4);
    spread.push(buffer);
  }
  return { original, spread: spreadBuffers(segments, spread) };
};
