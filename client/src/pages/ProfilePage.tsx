import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Input from '../components/Input'
import Button from '../components/Button'
import Spinner from '../components/Spinner'
import { getProfile, updateProfile, getAchievements } from '../api/profile.api'
import { enableTwoFa, disableTwoFa } from '../api/auth.api'
import { getCategories } from '../api/categories.api'
import { downloadCertificate } from '../api/applications.api'
import { getMyVolunteerReviews } from '../api/reviews.api'
import { formatDate } from '../utils/formatDate'

const FORMAT_OPTIONS = [
  { label: 'Дистанційно', value: 'REMOTE' },
  { label: 'Офлайн', value: 'ON_SITE' },
  { label: 'Будь-який', value: 'ANY' },
] as const

const schema = z.object({
  firstName: z.string().min(1, "Введіть ім'я"),
  lastName: z.string().min(1, 'Введіть прізвище'),
  city: z.string().optional(),
  age: z.coerce.number().int().min(14).max(120).optional().or(z.literal('')),
  phone: z
    .string()
    .max(32)
    .regex(/^\+?[0-9\s\-()]*$/, 'Невірний формат телефону')
    .optional()
    .or(z.literal('')),
  telegram: z.string().max(100).optional().or(z.literal('')),
  messenger: z.string().max(200).optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [formatPreference, setFormatPreference] = useState<string>('ANY')
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: achievements } = useQuery({
    queryKey: ['achievements'],
    queryFn: getAchievements,
  })

  const { data: myReviews } = useQuery({
    queryKey: ['myVolunteerReviews'],
    queryFn: getMyVolunteerReviews,
  })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        city: profile.city ?? '',
        age: profile.age ?? '',
        phone: profile.phone ?? '',
        telegram: profile.telegram ?? '',
        messenger: profile.messenger ?? '',
      })
      setSelectedCategoryIds(profile.interests.map(i => i.id))
      setFormatPreference(profile.formatPreference ?? 'ANY')
    }
  }, [profile, reset])

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    },
  })

  const twoFaMutation = useMutation({
    mutationFn: (enable: boolean) => (enable ? enableTwoFa() : disableTwoFa()),
    onSuccess: (_data, enable) => setTwoFaEnabled(enable),
  })

  function toggleCategory(id: string) {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function onSubmit(data: FormData) {
    await updateMutation.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      city: data.city || undefined,
      age: data.age ? Number(data.age) : undefined,
      phone: data.phone || undefined,
      telegram: data.telegram || undefined,
      messenger: data.messenger || undefined,
      formatPreference,
      categoryIds: selectedCategoryIds,
    })
  }

  if (isLoading) {
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
          <h1 className="mb-8 text-3xl font-bold text-white">Мій профіль</h1>

          {/* Profile form */}
          <div className="rounded-2xl bg-surface border border-white/[0.06] p-6 mb-6">
            <h2 className="mb-5 text-base font-semibold text-white">Особисті дані</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Ім'я"
                  placeholder="Іван"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Прізвище"
                  placeholder="Коваль"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Місто"
                  placeholder="Київ"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Input
                  label="Вік"
                  type="number"
                  placeholder="25"
                  error={errors.age?.message}
                  {...register('age')}
                />
              </div>

              {/* Contacts (optional) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">Контакти (необов'язково)</label>
                <p className="text-xs text-muted">
                  Організація побачить ваш email автоматично. Додайте інші канали для зв'язку.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Input
                    label="Телефон"
                    placeholder="+380..."
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Input
                    label="Telegram"
                    placeholder="@username"
                    error={errors.telegram?.message}
                    {...register('telegram')}
                  />
                  <Input
                    label="Інший месенджер"
                    placeholder="Viber, Signal..."
                    error={errors.messenger?.message}
                    {...register('messenger')}
                  />
                </div>
              </div>

              {/* Format preference */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">Формат участі</label>
                <div className="flex gap-2">
                  {FORMAT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormatPreference(opt.value)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        formatPreference === opt.value
                          ? 'bg-accent text-bg'
                          : 'border border-white/10 text-muted hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-white">Інтереси</label>
                <p className="text-xs text-muted">Оберіть категорії, що вас цікавлять</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {categories.map(cat => {
                    const selected = selectedCategoryIds.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                          selected
                            ? 'bg-accent text-bg'
                            : 'border border-white/10 text-muted hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {cat.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {updateMutation.isError && (
                <p className="text-sm text-red-400">Помилка збереження. Спробуйте ще раз.</p>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  variant="filled"
                  loading={isSubmitting || updateMutation.isPending}
                >
                  Зберегти
                </Button>
                {saveSuccess && (
                  <span className="text-sm text-accent">Збережено ✓</span>
                )}
              </div>
            </form>
          </div>

          {/* Achievements */}
          {achievements && achievements.completedCount > 0 && (
            <div className="rounded-2xl bg-surface border border-white/[0.06] p-6 mb-6">
              <h2 className="mb-4 text-base font-semibold text-white">Мої досягнення</h2>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="rounded-xl bg-bg border border-white/[0.06] px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-accent">
                    {achievements.totalHours.toFixed(1)}
                  </p>
                  <p className="mt-1 text-xs text-muted">годин</p>
                </div>
                <div className="rounded-xl bg-bg border border-white/[0.06] px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-accent">
                    {achievements.completedCount}
                  </p>
                  <p className="mt-1 text-xs text-muted">завершених</p>
                </div>
                <div className="rounded-xl bg-bg border border-white/[0.06] px-4 py-3 text-center">
                  <div className="flex flex-wrap items-center justify-center gap-1 min-h-[1.75rem]">
                    {achievements.badges.length === 0 ? (
                      <span className="text-xs text-muted">—</span>
                    ) : (
                      achievements.badges.map((b) => (
                        <span
                          key={b}
                          className="rounded-full bg-accent/10 border border-accent/30 px-2 py-0.5 text-xs font-medium text-accent"
                        >
                          {b}
                        </span>
                      ))
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">бейджі</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {achievements.completed.map((c) => (
                  <div
                    key={c.applicationId}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-1">
                        {c.initiativeTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {c.organizationName} · {formatDate(c.completedAt)} · {c.hours.toFixed(1)} год
                      </p>
                    </div>
                    <button
                      onClick={() => downloadCertificate(c.applicationId)}
                      className="text-xs font-medium text-accent hover:underline shrink-0"
                    >
                      Сертифікат ↓
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rating + reviews */}
          {myReviews && myReviews.reviewCount > 0 && (
            <div className="rounded-2xl bg-surface border border-white/[0.06] p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">Мій рейтинг</h2>
                <p className="text-sm text-accent">
                  ★ {myReviews.avgRating?.toFixed(1) ?? '—'}
                  <span className="text-muted ml-1">
                    · {myReviews.reviewCount} відгуків
                  </span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {myReviews.reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-white/[0.06] px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white line-clamp-1">
                        {r.authorName || 'Організація'}
                      </p>
                      <p className="text-xs text-accent shrink-0">★ {r.rating}</p>
                    </div>
                    {r.comment && (
                      <p className="mt-1 text-sm text-white/80 whitespace-pre-line">
                        {r.comment}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted">
                      {formatDate(r.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2FA card */}
          <div className="rounded-2xl bg-surface border border-white/[0.06] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-white">
                  Двофакторна аутентифікація
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Підтвердження входу через email-код
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => twoFaMutation.mutate(!twoFaEnabled)}
                disabled={twoFaMutation.isPending}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none disabled:opacity-50 ${
                  twoFaEnabled ? 'bg-accent' : 'bg-white/10'
                }`}
                role="switch"
                aria-checked={twoFaEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    twoFaEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {twoFaEnabled && (
              <p className="mt-3 text-xs text-accent">
                ✓ Двофакторна аутентифікація активна
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
