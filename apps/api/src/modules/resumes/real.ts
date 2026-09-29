import { ErrorCode } from '@skillforge/contract';
export class RealService {
  async handle() { throw { status: 501, code: ErrorCode.NOT_IMPLEMENTED, message: 'Not implemented' }; }
}