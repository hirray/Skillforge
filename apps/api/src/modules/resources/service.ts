import { config } from '../../config';
import { realResourcesService } from './real';
import { mockResourcesService } from './mock';

export const getResourcesService = () => {
  return config.RESOURCES_SOURCE === 'real' ? realResourcesService : mockResourcesService;
};

export const getService = getResourcesService;