import { config } from '../../config';
import { MockService } from './mock';
import { RealService } from './real';

const mockServiceInstance = new MockService();
const realServiceInstance = new RealService();

export const getService = () => {
  const isReal = config.GITHUB_SOURCE === 'real';
  return isReal ? realServiceInstance : mockServiceInstance;
};