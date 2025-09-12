export enum NotificationType {
  MatchChanges = 'MatchChanges',
  ScoreUpdates = 'ScoreUpdates',
  RankingUpdates = 'RankingUpdates',
}

export const notificationTypeLabel: Record<NotificationType, string> = {
  [NotificationType.MatchChanges]: 'Match time or place has changed',
  [NotificationType.ScoreUpdates]: 'A score for your match has been added',
  [NotificationType.RankingUpdates]: 'Your ranking in the league has changed',
};

export interface UserTeamNotifications {
  user: string;
  name: string;
  email: string;
  team: string;
  notifications: NotificationType[];
}

export interface EmailNotificationUpdates<T extends NotificationUpdate> {
  email: string;
  userName: string;
  teamName: string;
  notifications: T[];
}

export interface NotificationUpdate {
  isScoreUpdate?: boolean;
  isRankingUpdates?: boolean;
  isMatchChange?: boolean;
}

export interface ScoreUpdateNotification extends NotificationUpdate {
  isScoreUpdate: true;
  updates: { homeTeam: string; homeScore: number | string; awayScore: number | string; awayTeam: string }[];
}

export interface MatchChangeNotification extends NotificationUpdate {
  isMatchChange: true;
  updates: {
    oldTeam: string;
    newTeam: string;
    oldTime: string;
    newTime: string;
    oldLocation: string;
    newLocation: string;
  }[];
}

export interface RankingUpdateNotification extends NotificationUpdate {
  isRankingUpdate: true;
  update: { oldRank: number | string; newRank: number | string };
}
