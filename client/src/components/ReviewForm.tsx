import { useState } from 'react'
import Button from './Button'
import StarRating from './StarRating'
import Textarea from './Textarea'

interface Props {
  title?: string
  submitLabel?: string
  onSubmit: (payload: { rating: number; comment?: string }) => void | Promise<void>
  onCancel?: () => void
  submitting?: boolean
  error?: string | null
}

export default function ReviewForm({
  title = 'Залишити відгук',
  submitLabel = 'Надіслати',
  onSubmit,
  onCancel,
  submitting = false,
  error = null,
}: Props) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)
    if (rating < 1 || rating > 5) {
      setLocalError('Будь ласка, поставте оцінку від 1 до 5')
      return
    }
    if (comment.length > 500) {
      setLocalError('Коментар не може бути довшим за 500 символів')
      return
    }
    await onSubmit({ rating, comment: comment.trim() || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-white">Оцінка</span>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <Textarea
        label="Коментар (необов'язково)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="Поділіться враженнями..."
        maxLength={500}
      />
      <p className="text-xs text-muted -mt-2">{comment.length}/500</p>

      {(error || localError) && (
        <p className="text-sm text-red-400">{error ?? localError}</p>
      )}

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Скасувати
          </Button>
        )}
        <Button type="submit" variant="filled" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
