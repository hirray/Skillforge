import { config } from '../../config';
import { MockService } from './mock';
import { RealService } from './real';

export const getService = () => {
  const isReal = config.ADMIN_SOURCE === 'real';
  return isReal ? new RealService() : new MockService();
};