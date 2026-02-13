
import { USE_MOCKS } from '../mocks';
import { notificationService as RealNotificationService } from './real/notificationService';
import { notificationService as MockNotificationService } from './mocks/notificationService';

const getService = () => {
  if (USE_MOCKS) {
    return MockNotificationService;
  }

  // Adapter to standardize the function name
  return {
    ...RealNotificationService,
    getUnreadCount: RealNotificationService.getUnreadNotificationsCount,
  };
};

export const notificationService = getService();
