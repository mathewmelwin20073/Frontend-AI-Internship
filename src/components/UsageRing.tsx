interface UsageRingProps {
  progress: number;
  label: string;
  detail: string;
  overGoal: boolean;
}

export function UsageRing({ progress, label, detail, overGoal }: UsageRingProps) {
  const size = 188;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  return (
    <div className="relative flex h-[188px] w-[188px] items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={overGoal ? "text-rose-400" : "text-teal-400"}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-3xl font-semibold tracking-tight text-white">{label}</p>
        <p className="mt-1 text-sm text-slate-400">{detail}</p>
      </div>
    </div>
  );
}
