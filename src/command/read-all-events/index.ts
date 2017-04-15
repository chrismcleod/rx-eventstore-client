import { Position } from "../command";

export interface Params {
  position?: Position;
  maxEvents?: number;
  resolveLinks?: boolean;
  requireMaster?: boolean;
}

export const baseConvertParams = <TParams extends Params>(defaultPosition: Position) => (params: TParams) => {
  const position = params.position || defaultPosition;
  return {
    commitPosition: position.commit,
    maxCount: params.maxEvents,
    preparePosition: position.prepare,
    requireMaster: params.requireMaster,
    resolveLinkTos: params.resolveLinks
  };
};
