import { formatDuration } from "@/lib/screenTime";
import type { ScreenTimeApp } from "@/types/screenTime";

interface AppUsageListProps {
  apps: ScreenTimeApp[];
  selectedAppId: string;
  todayTotals: Record<string, number>;
  todaySeconds: number;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAddMinutes: (appId: string, minutes: number) => void;
}

export function AppUsageList({
  apps,
  selectedAppId,
  todayTotals,
  todaySeconds,
  onSelect,
  onRemove,
  onAddMinutes,
}: AppUsageListProps) {
  return (
    <ul className="space-y-3">
      {apps.map((app) => {
        const seconds = todayTotals[app.id] ?? 0;
        const share = todaySeconds > 0 ? (seconds / todaySeconds) * 100 : 0;
        const selected = app.id === selectedAppId;

        return (
          <li key={app.id}>
            <div
              className={`rounded-xl border p-4 transition ${
                selected
                  ? "border-teal-400/60 bg-teal-400/5"
                  : "border-slate-800 bg-slate-900/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(app.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: app.color }}
                  />
                  <span className="truncate font-medium text-slate-100">{app.name}</span>
                  {selected ? (
                    <span className="rounded-full bg-teal-400/15 px-2 py-0.5 text-[11px] font-medium text-teal-300">
                      Tracking
                    </span>
                  ) : null}
                </button>
                <div className="flex items-center gap-2">
                  <p className="text-sm tabular-nums text-slate-300">{formatDuration(seconds)}</p>
                  {apps.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => onRemove(app.id)}
                      className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-800 hover:text-rose-300"
                      aria-label={`Remove ${app.name}`}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${share}%`, backgroundColor: app.color }}
                />
              </div>
              <div className="mt-3 flex gap-2">
                {[5, 15, 30].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => onAddMinutes(app.id, minutes)}
                    className="rounded-lg border border-slate-800 px-2.5 py-1 text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200"
                  >
                    +{minutes}m
                  </button>
                ))}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
