import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Input from '../components/Input'
import Textarea from '../components/Textarea'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import { getInitiative, createInitiative, updateInitiative } from '../api/initiatives.api'
import { getCategories } from '../api/categories.api'

const schema = z.object({
  title: z.string().min(1, 'Обов\'язкове поле').max(255),
  categoryId: z.string().uuid('Оберіть категорію'),
  type: z.enum(['URGENT', 'PLANNED', 'ONGOING'] as const),
  format: z.enum(['REMOTE', 'ON_SITE'] as const),
  city: z.string().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  minAge: z.coerce.number().int().min(0).max(100).optional().or(z.literal('')),
  slotsNeeded: z.coerce.number().int().min(1).max(10000).optional().or(z.literal('')),
  description: z.string().min(10, 'Мінімум 10 символів'),
  requirements: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const TYPE_OPTIONS = [
  { value: 'URGENT', label: 'Термінова' },
  { value: 'PLANNED', label: 'Планова' },
  { value: 'ONGOING', label: 'Постійна' },
] as const

const FORMAT_OPTIONS = [
  { value: 'REMOTE', label: 'Дистанційно' },
  { value: 'ON_SITE', label: 'Офлайн' },
] as const

function TogglePill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-accent text-bg'
          : 'border border-white/10 text-muted hover:border-white/20 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

export default function InitiativeFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['initiative', id],
    queryFn: () => getInitiative(id!),
    enabled: isEdit,
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'PLANNED',
      format: 'REMOTE',
    },
  })

  useEffect(() => {
    if (existing) {
      setValue('title', existing.title)
      setValue('categoryId', existing.categoryId)
      setValue('type', existing.type as 'URGENT' | 'PLANNED' | 'ONGOING')
      setValue('format', existing.format as 'REMOTE' | 'ON_SITE')
      setValue('city', existing.city ?? '')
      setValue('startsAt', existing.startsAt ? existing.startsAt.slice(0, 10) : '')
      setValue('endsAt', existing.endsAt ? existing.endsAt.slice(0, 10) : '')
      setValue('minAge', existing.minAge ?? '')
      setValue('slotsNeeded', existing.slotsNeeded ?? '')
      setValue('description', existing.description)
      setValue('requirements', existing.requirements ?? '')
    }
  }, [existing, setValue])

  const createMutation = useMutation({
    mutationFn: createInitiative,
    onSuccess: () => navigate('/dashboard'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: unknown) => updateInitiative(id!, data),
    onSuccess: () => navigate('/dashboard'),
  })

  const isPending = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error ?? updateMutation.error

  const selectedType = watch('type')
  const selectedFormat = watch('format')
  const showCity = selectedFormat === 'ON_SITE'

  function onSubmit(data: FormData) {
    const payload = {
      ...data,
      minAge: data.minAge === '' ? undefined : Number(data.minAge),
      slotsNeeded: data.slotsNeeded === '' ? undefined : Number(data.slotsNeeded),
      city: data.city || undefined,
      startsAt: data.startsAt || undefined,
      endsAt: data.endsAt || undefined,
      requirements: data.requirements || undefined,
    }
    if (isEdit) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  if (isEdit && loadingExisting) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center pt-20">
          <Spinner />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
          <h1 className="mb-8 text-3xl font-bold text-white">
            {isEdit ? 'Редагувати ініціативу' : 'Нова ініціатива'}
          </h1>

          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
              {/* Title */}
              <Input
                label="Назва"
                placeholder="Назва ініціативи"
                error={errors.title?.message}
                {...register('title')}
              />

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white">Категорія</label>
                <select
                  className={`w-full rounded-xl bg-surface border ${errors.categoryId ? 'border-red-500' : 'border-white/[0.08]'} px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent transition-colors`}
                  {...register('categoryId')}
                >
                  <option value="">Оберіть категорію</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-red-400">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white">Тип</label>
                <div className="flex flex-wrap gap-2">
                  {TYPE_OPTIONS.map(opt => (
                    <TogglePill
                      key={opt.value}
                      active={selectedType === opt.value}
                      onClick={() => setValue('type', opt.value)}
                    >
                      {opt.label}
                    </TogglePill>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white">Формат</label>
                <div className="flex gap-2">
                  {FORMAT_OPTIONS.map(opt => (
                    <TogglePill
                      key={opt.value}
                      active={selectedFormat === opt.value}
                      onClick={() => setValue('format', opt.value)}
                    >
                      {opt.label}
                    </TogglePill>
                  ))}
                </div>
              </div>

              {/* City — conditional */}
              {showCity && (
                <Input
                  label="Місто"
                  placeholder="Київ"
                  error={errors.city?.message}
                  {...register('city')}
                />
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Дата початку"
                  type="date"
                  error={errors.startsAt?.message}
                  {...register('startsAt')}
                />
                <Input
                  label="Дата завершення"
                  type="date"
                  error={errors.endsAt?.message}
                  {...register('endsAt')}
                />
              </div>

              {/* Min age + slots */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Мінімальний вік (необов'язково)"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="18"
                  error={errors.minAge?.message}
                  {...register('minAge')}
                />
                <Input
                  label="Скільки волонтерів потрібно? (необов'язково)"
                  type="number"
                  min={1}
                  max={10000}
                  placeholder="10"
                  error={errors.slotsNeeded?.message}
                  {...register('slotsNeeded')}
                />
              </div>

              {/* Description */}
              <Textarea
                label="Опис"
                rows={5}
                placeholder="Розкажіть про ініціативу..."
                error={errors.description?.message}
                {...register('description')}
              />

              {/* Requirements */}
              <Textarea
                label="Вимоги до волонтерів (необов'язково)"
                rows={4}
                placeholder="Кожна вимога з нового рядка..."
                error={errors.requirements?.message}
                {...register('requirements')}
              />

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400">
                  Помилка. Перевірте дані та спробуйте ще раз.
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" loading={isPending}>
                  {isEdit ? 'Зберегти' : 'Опублікувати'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                >
                  Скасувати
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
