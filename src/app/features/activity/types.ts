export type ActivityAction = 'upload' | 'delete' | 'share' | 'login' | 'version';

export interface ActivityItem {
  id: string;
  userId: string | null;
  userName: string | null;
  action: ActivityAction;
  description: string;
  detail: string;
  timestamp: string;
  targetId: string | null;
  targetTitle: string | null;
}

export interface ActivityNotification {
  id: string;
  type: 'upload' | 'view' | 'category';
  message: string;
  time: string;
  read: boolean;
  href: string;
}
