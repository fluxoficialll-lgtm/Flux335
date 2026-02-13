
import { USE_MOCKS } from '../mocks';
import { chatService as RealChatService } from './real/chatService';
import { chatService as MockChatService } from './mocks/chatService';

const getService = () => {
  if (USE_MOCKS) {
    return MockChatService;
  }

  // Adapter to standardize the function name
  return {
    ...RealChatService,
    getUnreadCount: RealChatService.getUnreadMessagesCount,
  };
};

export const chatService = getService();
