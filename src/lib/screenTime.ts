import type { DayRecord, ScreenTimeApp, ScreenTimeState } from "@/types/screenTime";

export const STORAGE_KEY = "screen-time-tracker:v1";

export const APP_COLORS = [
  "#14b8a6",
  "#f43f5e",
  "#8b5cf6",
  "#3b82f6",
  "#f59e0b",
  "#22c55e",
  "#ec4899",
  "#06b6d4",
] as const;

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const DEFAULT_APPS: ScreenTimeApp[] = [
  { id: "browser", name: "This browser", color: APP_COLORS[0] },
  { id: "social", name: "Social", color: APP_COLORS[1] },
  { id: "entertainment", name: "Entertainment", color: APP_COLORS[2] },
  { id: "work", name: "Work", color: APP_COLORS[3] },
];

export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLongDate(date = new Date()): string {
  return `${WEEKDAYS_LONG[date.getDay()]}, ${MONTHS_LONG[date.getMonth()]} ${date.getDate()}`;
}

export function weekdayShortFromKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return WEEKDAYS_SHORT[date.getDay()];
}

export function createDefaultState(): ScreenTimeState {
  return {
    apps: DEFAULT_APPS,
    days: [{ date: todayKey(), totals: {} }],
    dailyGoalMinutes: 240,
    selectedAppId: "browser",
  };
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function dayTotal(record: DayRecord | undefined): number {
  if (!record) {
    return 0;
  }

  return Object.values(record.totals).reduce((sum, value) => sum + value, 0);
}

export function getDayRecord(days: DayRecord[], date: string): DayRecord {
  return days.find((day) => day.date === date) ?? { date, totals: {} };
}

export function upsertDaySeconds(
  days: DayRecord[],
  date: string,
  appId: string,
  secondsToAdd: number,
): DayRecord[] {
  const existing = days.find((day) => day.date === date);

  if (!existing) {
    return [...days, { date, totals: { [appId]: secondsToAdd } }].slice(-14);
  }

  return days.map((day) => {
    if (day.date !== date) {
      return day;
    }

    return {
      ...day,
      totals: {
        ...day.totals,
        [appId]: (day.totals[appId] ?? 0) + secondsToAdd,
      },
    };
  });
}

export function lastSevenDays(days: DayRecord[], endDate = new Date()): DayRecord[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (6 - index));
    const key = todayKey(date);
    return getDayRecord(days, key);
  });
}

export function loadState(): ScreenTimeState {
  if (typeof window === "undefined") {
    return createDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw) as Partial<ScreenTimeState>;
    const defaults = createDefaultState();

    return {
      apps: Array.isArray(parsed.apps) && parsed.apps.length > 0 ? parsed.apps : defaults.apps,
      days: Array.isArray(parsed.days) ? parsed.days.slice(-14) : defaults.days,
      dailyGoalMinutes:
        typeof parsed.dailyGoalMinutes === "number" && parsed.dailyGoalMinutes > 0
          ? parsed.dailyGoalMinutes
          : defaults.dailyGoalMinutes,
      selectedAppId:
        typeof parsed.selectedAppId === "string" ? parsed.selectedAppId : defaults.selectedAppId,
    };
  } catch {
    return createDefaultState();
  }
}

export function saveState(state: ScreenTimeState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
