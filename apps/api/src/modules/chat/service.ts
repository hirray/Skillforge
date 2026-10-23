import { config } from '../../config';
import { realChatService } from './real';
import { mockChatService } from './mock';

export const getChatService = () => {
  return config.CHAT_SOURCE === 'real' ? realChatService : mockChatService;
};

export const getService = getChatService;