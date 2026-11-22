import { RealUserService } from './real';

export const getService = () => {
  return new RealUserService();
};
