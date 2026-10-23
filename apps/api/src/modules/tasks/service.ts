import { config } from '../../config';
import { realTasksService } from './real';
import { mockTasksService } from './mock';

export const getTasksService = () => {
  return config.TASKS_SOURCE === 'real' ? realTasksService : mockTasksService;
};

export const getService = getTasksService;