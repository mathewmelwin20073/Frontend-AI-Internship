import { formatDuration } from "@/lib/screenTime";

interface WeeklyChartProps {
  week: { date: string; total: number; label: string }[];
}

export function WeeklyChart({ week }: WeeklyChartProps) {
  const max = Math.max(...week.map((day) => day.total), 1);
  const today = week[week.length - 1]?.date;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">Last 7 days</h2>
      <div className="mt-5 flex h-40 items-end gap-3">
        {week.map((day) => {
          const height = Math.max((day.total / max) * 100, day.total > 0 ? 6 : 2);
          const isToday = day.date === today;

          return (
            <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div
                className={`w-full rounded-t-lg ${isToday ? "bg-teal-400" : "bg-slate-700"}`}
                style={{ height: `${height}%` }}
                title={formatDuration(day.total)}
              />
              <span className={`text-xs ${isToday ? "text-teal-300" : "text-slate-500"}`}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
