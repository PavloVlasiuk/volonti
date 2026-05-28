import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../components/Input'
import Button from '../components/Button'
import { login, loginOrganization, verifyOtp } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'

const userLoginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(1, 'Введіть пароль'),
})

const orgLoginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(1, 'Введіть пароль'),
})

const otpSchema = z.object({
  code: z.string().length(6, 'Код має містити 6 цифр').regex(/^\d{6}$/, 'Тільки цифри'),
})

type UserLoginForm = z.infer<typeof userLoginSchema>
type OrgLoginForm = z.infer<typeof orgLoginSchema>
type OtpForm = z.infer<typeof otpSchema>
type LoginMode = 'user' | 'organization'

function roleRedirect(role?: string): string {
  if (role === 'ADMIN') return '/admin/organizations'
  return '/feed'
}

export default function LoginPage() {
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<LoginMode>('user')
  const [pendingToken, setPendingToken] = useState<string | null>(null)
  const [serverError, setServerError] = useState('')

  const userForm = useForm<UserLoginForm>({ resolver: zodResolver(userLoginSchema) })
  const orgForm = useForm<OrgLoginForm>({ resolver: zodResolver(orgLoginSchema) })
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) })

  function switchMode(next: LoginMode) {
    setMode(next)
    setServerError('')
    userForm.reset()
    orgForm.reset()
  }

  async function handleUserLogin(data: UserLoginForm) {
    setServerError('')
    try {
      const res = await login(data)
      if ('status' in res && res.status === 'otp_required') {
        setPendingToken(res.pendingToken)
      } else if ('accessToken' in res) {
        authLogin(res)
        const decoded = JSON.parse(atob(res.accessToken.split('.')[1]))
        navigate(roleRedirect(decoded.role))
      }
    } catch {
      setServerError('Невірний email або пароль')
    }
  }

  async function handleOrgLogin(data: OrgLoginForm) {
    setServerError('')
    try {
      const res = await loginOrganization(data)
      setPendingToken(res.pendingToken)
    } catch {
      setServerError('Невірний email або пароль')
    }
  }

  async function handleOtp(data: OtpForm) {
    if (!pendingToken) return
    setServerError('')
    try {
      const res = await verifyOtp({ pendingToken, code: data.code })
      authLogin(res)
      if (mode === 'organization') {
        navigate('/dashboard')
      } else {
        const decoded = JSON.parse(atob(res.accessToken.split('.')[1]))
        navigate(roleRedirect(decoded.role))
      }
    } catch {
      setServerError('Невірний або прострочений код')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-white">
            Volon<span className="text-accent">ti</span>
          </Link>
        </div>

        <div className="rounded-2xl bg-surface border border-white/[0.06] p-8">
          {!pendingToken ? (
            <>
              <h2 className="mb-5 text-xl font-bold text-white">Увійти до акаунту</h2>

              {/* Mode toggle */}
              <div className="mb-6 flex rounded-xl bg-bg p-1 gap-1">
                <button
                  type="button"
                  onClick={() => switchMode('user')}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    mode === 'user'
                      ? 'bg-surface text-white shadow'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  Особистий вхід
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('organization')}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                    mode === 'organization'
                      ? 'bg-surface text-white shadow'
                      : 'text-muted hover:text-white'
                  }`}
                >
                  Організація
                </button>
              </div>

              {mode === 'user' ? (
                <form onSubmit={userForm.handleSubmit(handleUserLogin)} className="flex flex-col gap-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    error={userForm.formState.errors.email?.message}
                    {...userForm.register('email')}
                  />
                  <Input
                    label="Пароль"
                    type="password"
                    placeholder="••••••••"
                    error={userForm.formState.errors.password?.message}
                    {...userForm.register('password')}
                  />

                  {serverError && <p className="text-sm text-red-400">{serverError}</p>}

                  <Button
                    type="submit"
                    variant="filled"
                    size="lg"
                    loading={userForm.formState.isSubmitting}
                    className="w-full mt-2"
                  >
                    Увійти
                  </Button>
                </form>
              ) : (
                <form onSubmit={orgForm.handleSubmit(handleOrgLogin)} className="flex flex-col gap-4">
                  <Input
                    label="Email організації"
                    type="email"
                    placeholder="org@example.com"
                    error={orgForm.formState.errors.email?.message}
                    {...orgForm.register('email')}
                  />
                  <Input
                    label="Пароль"
                    type="password"
                    placeholder="••••••••"
                    error={orgForm.formState.errors.password?.message}
                    {...orgForm.register('password')}
                  />

                  {serverError && <p className="text-sm text-red-400">{serverError}</p>}

                  <Button
                    type="submit"
                    variant="filled"
                    size="lg"
                    loading={orgForm.formState.isSubmitting}
                    className="w-full mt-2"
                  >
                    Увійти
                  </Button>
                </form>
              )}

              <p className="mt-5 text-center text-sm text-muted">
                {mode === 'user' ? (
                  <>
                    Немає акаунту?{' '}
                    <Link to="/register/volunteer" className="text-accent hover:underline">
                      Зареєструватися
                    </Link>
                  </>
                ) : (
                  <>
                    Ще не зареєстровані?{' '}
                    <Link to="/register/organization" className="text-accent hover:underline">
                      Реєстрація організації
                    </Link>
                  </>
                )}
              </p>
            </>
          ) : (
            <>
              <h2 className="mb-2 text-xl font-bold text-white">Підтвердження входу</h2>
              <p className="mb-6 text-sm text-muted">
                Ми надіслали 6-значний код на вашу пошту. Введіть його нижче.
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

              <button
                onClick={() => { setPendingToken(null); setServerError('') }}
                className="mt-4 text-sm text-muted hover:text-white transition-colors"
              >
                ← Повернутись до входу
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
