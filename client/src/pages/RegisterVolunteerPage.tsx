import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import Input from '../components/Input'
import Button from '../components/Button'
import { registerVolunteer, verifyEmail } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'

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

const otpSchema = z.object({
  code: z.string().length(6, 'Код має містити 6 цифр').regex(/^\d{6}$/, 'Тільки цифри'),
})

type FormData = z.infer<typeof schema>
type OtpForm = z.infer<typeof otpSchema>

export default function RegisterVolunteerPage() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()
  const [serverError, setServerError] = useState('')
  const [pendingToken, setPendingToken] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      const res = await registerVolunteer({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
      setEmail(data.email)
      setPendingToken(res.pendingToken)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setServerError(e?.response?.data?.message ?? 'Помилка реєстрації. Спробуйте ще раз.')
    }
  }

  async function handleOtp(data: OtpForm) {
    if (!pendingToken) return
    setServerError('')
    try {
      const tokens = await verifyEmail({ pendingToken, code: data.code })
      authLogin(tokens)
      navigate('/feed')
    } catch {
      setServerError('Невірний або прострочений код')
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
          {!pendingToken ? (
            <>
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
            </>
          ) : (
            <>
              <h2 className="mb-2 text-xl font-bold text-white">Підтвердження email</h2>
              <p className="mb-6 text-sm text-muted">
                Ми надіслали 6-значний код на <span className="text-white">{email}</span>. Введіть його нижче, щоб завершити реєстрацію.
              </p>

              <form onSubmit={otpForm.handleSubmit(handleOtp)} className="flex flex-col gap-4">
                <Input
                  label="Код підтвердження"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456"
                  maxLength={6}
                  error={otpForm.formState.errors.code?.message}
                  {...otpForm.register('code')}
                />

                {serverError && <p className="text-sm text-red-400">{serverError}</p>}

                <Button
                  type="submit"
                  variant="filled"
                  size="lg"
                  loading={otpForm.formState.isSubmitting}
                  className="w-full mt-2"
                >
                  Підтвердити
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
