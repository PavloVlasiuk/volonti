import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from './Button'
import Textarea from './Textarea'
import Input from './Input'
import { AvailabilitySlot } from '../types/application.types'
import type { SubmitApplicationPayload } from '../types/application.types'
import type { Initiative } from '../types/initiative.types'
import { submitApplication } from '../api/applications.api'
import { getProfile } from '../api/profile.api'

const SLOT_OPTIONS: { value: AvailabilitySlot; label: string }[] = [
  { value: AvailabilitySlot.WEEKDAYS, label: 'Будні' },
  { value: AvailabilitySlot.WEEKENDS, label: 'Вихідні' },
  { value: AvailabilitySlot.EVENINGS, label: 'Вечори' },
  { value: AvailabilitySlot.FULL_TIME, label: 'Повний час' },
]

const schema = z.object({
  motivation: z
    .string()
    .min(1, 'Опишіть, чому хочете долучитися')
    .max(500, 'Максимум 500 символів'),
  availability: z
    .array(z.enum([
      AvailabilitySlot.WEEKDAYS,
      AvailabilitySlot.WEEKENDS,
      AvailabilitySlot.EVENINGS,
      AvailabilitySlot.FULL_TIME,
    ]))
    .max(4),
  contactPhone: z
    .string()
    .max(32)
    .regex(/^\+?[0-9\s\-()]+$/, 'Невірний формат телефону')
    .optional()
    .or(z.literal('')),
  experience: z.string().max(300).optional().or(z.literal('')),
  hasTransport: z.boolean(),
  canStartImmediately: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initiative: Initiative
  onClose: () => void
  onSuccess: () => void
  onAlreadyApplied: () => void
}

export default function ApplicationFormModal({
  initiative,
  onClose,
  onSuccess,
  onAlreadyApplied,
}: Props) {
  const queryClient = useQueryClient()
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      motivation: '',
      availability: [],
      contactPhone: '',
      experience: '',
      hasTransport: false,
      canStartImmediately: false,
    },
  })

  useEffect(() => {
    const phone = (profile as unknown as { contactPhone?: string })?.contactPhone
    if (phone) reset((v) => ({ ...v, contactPhone: phone }))
  }, [profile, reset])

  const availability = watch('availability')

  function toggleSlot(slot: AvailabilitySlot) {
    const next = availability.includes(slot)
      ? availability.filter((s) => s !== slot)
      : [...availability, slot]
    setValue('availability', next, { shouldDirty: true })
  }

  const mutation = useMutation({
    mutationFn: (payload: SubmitApplicationPayload) =>
      submitApplication(initiative.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      queryClient.invalidateQueries({ queryKey: ['initiative', initiative.id] })
      onSuccess()
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 409) {
        onAlreadyApplied()
      }
    },
  })

  function onSubmit(values: FormValues) {
    mutation.mutate({
      motivation: values.motivation,
      availability: values.availability,
      contactPhone: values.contactPhone || undefined,
      experience: values.experience || undefined,
      hasTransport: values.hasTransport,
      canStartImmediately: values.canStartImmediately,
    })
  }

  const showTransport = initiative.format === 'ON_SITE'
  const showImmediately = initiative.type === 'URGENT'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-surface border border-white/[0.08] p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-white"
          aria-label="Закрити"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Подати заявку</h2>
        <p className="text-sm text-muted mb-5 line-clamp-2">{initiative.title}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Textarea
            label="Чому хочете долучитися? *"
            placeholder="Коротко розкажіть про мотивацію..."
            rows={3}
            error={errors.motivation?.message}
            {...register('motivation')}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white">Доступність</label>
            <div className="flex flex-wrap gap-2">
              {SLOT_OPTIONS.map((opt) => {
                const selected = availability.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleSlot(opt.value)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      selected
                        ? 'bg-accent text-bg'
                        : 'border border-white/10 text-muted hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <Input
            label="Контактний телефон"
            placeholder="+380..."
            error={errors.contactPhone?.message}
            {...register('contactPhone')}
          />

          <Textarea
            label="Релевантний досвід"
            placeholder="Чи доводилось вам раніше волонтерити?"
            rows={2}
            error={errors.experience?.message}
            {...register('experience')}
          />

          <div className="flex flex-col gap-2">
            {showTransport && (
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-accent h-4 w-4"
                  {...register('hasTransport')}
                />
                Маю власний транспорт
              </label>
            )}
            {showImmediately && (
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-accent h-4 w-4"
                  {...register('canStartImmediately')}
                />
                Готовий долучитися негайно
              </label>
            )}
          </div>

          {mutation.isError && mutation.error?.response?.status !== 409 && (
            <p className="text-sm text-red-400">
              Не вдалось подати заявку. Спробуйте ще раз.
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              variant="filled"
              loading={isSubmitting || mutation.isPending}
              className="flex-1"
            >
              Надіслати
            </Button>
            <Button type="button" variant="outlined" onClick={onClose}>
              Скасувати
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
