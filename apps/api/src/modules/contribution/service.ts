import { config } from '../../config';
import { MockService } from './mock';
import { RealService } from './real';

const mockInstance = new MockService();
const realInstance = new RealService();

export const getService = () => {
  const isReal = config.CONTRIBUTION_SOURCE === 'real';
  return isReal ? realInstance : mockInstance;
};
