export const FLAGS_NONE = 0x00;
export const FLAGS_AUTH = 0x01;

export const UINT32_LENGTH = 4;
export const GUID_LENGTH = 16;
export const HEADER_LENGTH = 1 + 1 + GUID_LENGTH;

export const COMMAND_OFFSET = UINT32_LENGTH;
export const FLAGS_OFFSET = COMMAND_OFFSET + 1;
export const CORRELATION_ID_OFFSET = FLAGS_OFFSET + 1;
export const DATA_OFFSET = CORRELATION_ID_OFFSET + GUID_LENGTH;
