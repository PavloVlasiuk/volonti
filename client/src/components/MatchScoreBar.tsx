interface Props {
  score: number
  label?: string
}

export default function MatchScoreBar({ score, label = 'Збіг з профілем' }: Props) {
  return (
    <div className="space-y-1">
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
    </div>
  )
}
