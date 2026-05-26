interface Props {
  value: number
  onChange?: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  readOnly?: boolean
}

const sizeMap = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
}

export default function StarRating({
  value,
  onChange,
  size = 'md',
  readOnly = false,
}: Props) {
  const stars = [1, 2, 3, 4, 5]
  const interactive = !readOnly && !!onChange

  return (
    <div className={`inline-flex items-center gap-1 ${sizeMap[size]}`}>
      {stars.map((s) => {
        const filled = s <= Math.round(value)
        const color = filled ? 'text-accent' : 'text-muted/40'
        if (!interactive) {
          return (
            <span key={s} className={color} aria-hidden>
              ★
            </span>
          )
        }
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange?.(s)}
            className={`${color} hover:text-accent transition-colors`}
            aria-label={`Оцінка ${s}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
