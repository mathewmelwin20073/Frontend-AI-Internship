"use client";

import { FormEvent, useState } from "react";
import { AppUsageList } from "@/components/AppUsageList";
import { UsageRing } from "@/components/UsageRing";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useScreenTime } from "@/hooks/useScreenTime";
import { formatClock, formatDuration, formatLongDate } from "@/lib/screenTime";

export function ScreenTimeTracker() {
  const tracker = useScreenTime();
  const [appName, setAppName] = useState("");
  const [goalInput, setGoalInput] = useState("");

  const handleAddApp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    tracker.addApp(appName);
    setAppName("");
  };

  const handleGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const minutes = Number(goalInput);
    if (Number.isFinite(minutes)) {
      tracker.setDailyGoalMinutes(minutes);
      setGoalInput("");
    }
  };

  const remaining = Math.max(tracker.dailyGoalSeconds - tracker.todaySeconds, 0);
  const dateLabel = formatLongDate();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-300">Focus</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Screen Time Tracker
          </h1>
          <p className="mt-2 text-slate-400">{dateLabel}</p>
        </div>
        <p className="max-w-sm text-sm text-slate-400">
          Time is attributed to the selected category while this tab is visible. Switching away
          pauses the live session automatically.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            <UsageRing
              progress={tracker.goalProgress}
              label={formatDuration(tracker.todaySeconds)}
              detail={`of ${formatDuration(tracker.dailyGoalSeconds)} goal`}
              overGoal={tracker.overGoal}
            />
            <div className="w-full flex-1 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">This session</p>
                <p className="mt-1 font-mono text-3xl text-white">
                  {formatClock(tracker.sessionSeconds)}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {tracker.paused
                    ? "Paused"
                    : tracker.overGoal
                      ? "Daily goal reached"
                      : `${formatDuration(remaining)} remaining today`}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={tracker.togglePaused}
                  className="rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-teal-300"
                >
                  {tracker.paused ? "Resume tracking" : "Pause tracking"}
                </button>
                <button
                  type="button"
                  onClick={tracker.resetToday}
                  className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
                >
                  Reset today
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleGoal} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="daily-goal">
              Daily goal in minutes
            </label>
            <input
              id="daily-goal"
              type="number"
              min={15}
              max={1440}
              value={goalInput}
              onChange={(event) => setGoalInput(event.target.value)}
              placeholder={`Daily goal (${tracker.dailyGoalMinutes} min)`}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-400"
            />
            <button
              type="submit"
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-teal-400 hover:text-white"
            >
              Update goal
            </button>
          </form>
        </section>

        <WeeklyChart week={tracker.week} />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Categories</h2>
            <p className="mt-1 text-sm text-slate-400">
              Select where live time should go, or log minutes by hand.
            </p>
          </div>
          <form onSubmit={handleAddApp} className="flex w-full gap-2 sm:w-auto">
            <label className="sr-only" htmlFor="app-name">
              Category name
            </label>
            <input
              id="app-name"
              value={appName}
              onChange={(event) => setAppName(event.target.value)}
              placeholder="Add category"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-teal-400 sm:w-56"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-white"
            >
              Add
            </button>
          </form>
        </div>
        <AppUsageList
          apps={tracker.apps}
          selectedAppId={tracker.selectedAppId}
          todayTotals={tracker.todayTotals}
          todaySeconds={tracker.todaySeconds}
          onSelect={tracker.setSelectedAppId}
          onRemove={tracker.removeApp}
          onAddMinutes={tracker.addManualMinutes}
        />
      </section>
    </div>
  );
}
