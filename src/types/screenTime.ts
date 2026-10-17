export interface ScreenTimeApp {
  id: string;
  name: string;
  color: string;
}

export interface DayRecord {
  date: string;
  totals: Record<string, number>;
}

export interface ScreenTimeState {
  apps: ScreenTimeApp[];
  days: DayRecord[];
  dailyGoalMinutes: number;
  selectedAppId: string;
}
