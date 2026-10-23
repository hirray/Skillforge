import { config } from '../../config';
import { realMilestonesService } from './real';
import { mockMilestonesService } from './mock';

export const getMilestonesService = () => {
  return config.MILESTONES_SOURCE === 'real' ? realMilestonesService : mockMilestonesService;
};

export const getService = getMilestonesService;