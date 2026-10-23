import { config } from '../../config';
import { realTeamService } from './real';
import { mockTeamService } from './mock';

export const getTeamService = () => {
  return config.TEAM_SOURCE === 'real' ? realTeamService : mockTeamService;
};

export const getService = getTeamService;