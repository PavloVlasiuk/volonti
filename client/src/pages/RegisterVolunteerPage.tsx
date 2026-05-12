import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import Input from '../components/Input'
import Button from '../components/Button'
import { registerVolunteer } from '../api/auth.api'

const schema = z
  .object({
    firstName: z.string().min(1, "Введіть ім'я"),
    lastName: z.string().min(1, 'Введіть прізвище'),
    email: z.string().email('Невірний формат email'),
    password: z.string().min(8, 'Мінімум 8 символів'),
    confirmPassword: z.string().min(1, 'Підтвердіть пароль'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Паролі не збігаються',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterVolunteerPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      await registerVolunteer({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
      navigate('/login')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setServerError(e?.response?.data?.message ?? 'Помилка реєстрації. Спробуйте ще раз.')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-white">
            Volon<span className="text-accent">ti</span>
          </Link>
        </div>

        <div className="rounded-2xl bg-surface border border-white/[0.06] p-8">
          <h2 className="mb-6 text-xl font-bold text-white">Реєстрація волонтера</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Пароль"
              type="password"
              placeholder="Мінімум 8 символів"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Підтвердження пароля"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {serverError && (
              <p className="text-sm text-red-400">{serverError}</p>
            )}

            <Button
              type="submit"
              variant="filled"
              size="lg"
              loading={isSubmitting}
              className="w-full mt-2"
            >
              Зареєструватися
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Реєструєте організацію?{' '}
            <Link to="/register/organization" className="text-accent hover:underline">
              Реєстрація НДО
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
