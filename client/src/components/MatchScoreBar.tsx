interface Props {
  score: number
  label?: string
  reasons?: string[]
}

export default function MatchScoreBar({ score, label = 'Збіг з профілем', reasons }: Props) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-xs font-semibold text-accent">{score}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
      {reasons && reasons.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {reasons.map((r) => (
            <span
              key={r}
              className="rounded-full border border-white/10 bg-surface px-2 py-0.5 text-[10px] font-medium text-muted"
            >
              {r}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
