import { config } from '../../config';
import { realProjectsService } from './real';
import { mockProjectsService } from './mock';

export const getProjectsService = () => {
  return config.PROJECTS_SOURCE === 'real' ? realProjectsService : mockProjectsService;
};

export const getService = getProjectsService;