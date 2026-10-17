"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  APP_COLORS,
  createDefaultState,
  dayTotal,
  formatDuration,
  getDayRecord,
  lastSevenDays,
  loadState,
  weekdayShortFromKey,
  saveState,
  todayKey,
  upsertDaySeconds,
} from "@/lib/screenTime";
import type { ScreenTimeApp, ScreenTimeState } from "@/types/screenTime";

interface UseScreenTimeResult {
  hydrated: boolean;
  apps: ScreenTimeApp[];
  selectedAppId: string;
  paused: boolean;
  sessionSeconds: number;
  todaySeconds: number;
  dailyGoalMinutes: number;
  dailyGoalSeconds: number;
  goalProgress: number;
  overGoal: boolean;
  todayTotals: Record<string, number>;
  week: { date: string; total: number; label: string }[];
  setSelectedAppId: (id: string) => void;
  togglePaused: () => void;
  setDailyGoalMinutes: (minutes: number) => void;
  addApp: (name: string) => void;
  removeApp: (id: string) => void;
  addManualMinutes: (appId: string, minutes: number) => void;
  resetToday: () => void;
}

export function useScreenTime(): UseScreenTimeResult {
  const [state, setState] = useState<ScreenTimeState>(createDefaultState);
  const [hydrated, setHydrated] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [visible, setVisible] = useState(true);

  const stateRef = useRef(state);
  const pausedRef = useRef(paused);
  const visibleRef = useRef(visible);

  stateRef.current = state;
  pausedRef.current = paused;
  visibleRef.current = visible;

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveState(state);
  }, [hydrated, state]);

  useEffect(() => {
    const onVisibility = () => {
      setVisible(document.visibilityState === "visible");
    };

    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const interval = window.setInterval(() => {
      if (pausedRef.current || !visibleRef.current) {
        return;
      }

      const current = stateRef.current;
      const date = todayKey();
      const appId = current.selectedAppId;

      setSessionSeconds((value) => value + 1);
      setState((previous) => ({
        ...previous,
        days: upsertDaySeconds(previous.days, date, appId, 1),
      }));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [hydrated]);

  const today = getDayRecord(state.days, todayKey());
  const todaySeconds = dayTotal(today);
  const dailyGoalSeconds = state.dailyGoalMinutes * 60;
  const goalProgress = Math.min(todaySeconds / dailyGoalSeconds, 1);
  const selectedExists = state.apps.some((app) => app.id === state.selectedAppId);

  const week = useMemo(
    () =>
      lastSevenDays(state.days).map((day) => ({
        date: day.date,
        total: dayTotal(day),
        label: weekdayShortFromKey(day.date),
      })),
    [state.days],
  );

  const setSelectedAppId = useCallback((id: string) => {
    setState((previous) => ({ ...previous, selectedAppId: id }));
  }, []);

  const togglePaused = useCallback(() => {
    setPaused((value) => !value);
  }, []);

  const setDailyGoalMinutes = useCallback((minutes: number) => {
    const next = Math.min(Math.max(Math.round(minutes), 15), 24 * 60);
    setState((previous) => ({ ...previous, dailyGoalMinutes: next }));
  }, []);

  const addApp = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }

    setState((previous) => {
      const color = APP_COLORS[previous.apps.length % APP_COLORS.length];
      const app: ScreenTimeApp = {
        id: `${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        name: trimmed,
        color,
      };

      return { ...previous, apps: [...previous.apps, app], selectedAppId: app.id };
    });
  }, []);

  const removeApp = useCallback((id: string) => {
    setState((previous) => {
      if (previous.apps.length <= 1) {
        return previous;
      }

      const apps = previous.apps.filter((app) => app.id !== id);
      const selectedAppId =
        previous.selectedAppId === id ? apps[0].id : previous.selectedAppId;

      return { ...previous, apps, selectedAppId };
    });
  }, []);

  const addManualMinutes = useCallback((appId: string, minutes: number) => {
    if (minutes <= 0) {
      return;
    }

    setState((previous) => ({
      ...previous,
      days: upsertDaySeconds(previous.days, todayKey(), appId, minutes * 60),
    }));
  }, []);

  const resetToday = useCallback(() => {
    const date = todayKey();
    setSessionSeconds(0);
    setState((previous) => ({
      ...previous,
      days: previous.days.map((day) =>
        day.date === date ? { ...day, totals: {} } : day,
      ),
    }));
  }, []);

  return {
    hydrated,
    apps: state.apps,
    selectedAppId: selectedExists ? state.selectedAppId : (state.apps[0]?.id ?? ""),
    paused,
    sessionSeconds,
    todaySeconds,
    dailyGoalMinutes: state.dailyGoalMinutes,
    dailyGoalSeconds,
    goalProgress,
    overGoal: todaySeconds >= dailyGoalSeconds,
    todayTotals: today.totals,
    week,
    setSelectedAppId,
    togglePaused,
    setDailyGoalMinutes,
    addApp,
    removeApp,
    addManualMinutes,
    resetToday,
  };
}

export { formatDuration };
