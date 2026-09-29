import { config } from '../../config';
import { MockService } from './mock';
import { RealService } from './real';

export const getService = () => {
  const sourceKey = 'AUTH_SOURCE';
  const isReal = config[sourceKey as keyof typeof config] === 'real';
  return isReal ? new RealService() : new MockService();
};