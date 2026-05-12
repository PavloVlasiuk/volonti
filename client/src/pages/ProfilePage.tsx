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
import { getProfile, updateProfile } from '../api/profile.api'
import { enableTwoFa, disableTwoFa } from '../api/auth.api'
import { getCategories } from '../api/categories.api'

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
