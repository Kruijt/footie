import { NotificationType } from './notifications.models';

export interface User {
  team?: string;
  name?: string;
  email?: string;
  notifications?: NotificationType[];
}
