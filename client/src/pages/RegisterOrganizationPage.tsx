import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../components/Input'
import Button from '../components/Button'
import { registerOrganization } from '../api/auth.api'

const MAX_PDF_MB = 10

const schema = z.object({
  name: z.string().min(1, 'Введіть назву організації'),
  type: z.enum(['NGO', 'CHARITY', 'INITIATIVE_GROUP', 'GOVERNMENT'], {
    message: 'Оберіть тип організації',
  }),
  edrpou: z
    .string()
    .length(8, 'ЄДРПОУ має містити рівно 8 цифр')
    .regex(/^\d{8}$/, 'Тільки цифри'),
  contactPerson: z.string().min(1, 'Введіть контактну особу'),
  email: z.string().email('Невірний формат email'),
  password: z.string().min(8, 'Мінімум 8 символів'),
})

type FormData = z.infer<typeof schema>

const ORG_TYPES = [
  { value: 'NGO', label: 'НГО / Громадська організація' },
  { value: 'CHARITY', label: 'Благодійний фонд' },
  { value: 'INITIATIVE_GROUP', label: 'Ініціативна група' },
  { value: 'GOVERNMENT', label: 'Муніципальна / Державна' },
] as const

export default function RegisterOrganizationPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [serverError, setServerError] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  function handleFile(f: File) {
    setFileError('')
    if (f.type !== 'application/pdf') {
      setFileError('Тільки PDF-файли')
      return
    }
    if (f.size > MAX_PDF_MB * 1024 * 1024) {
      setFileError(`Розмір файлу не може перевищувати ${MAX_PDF_MB} МБ`)
      return
    }
    setFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function onSubmit(data: FormData) {
    if (!file) {
      setFileError('Додайте витяг з держреєстру (PDF)')
      return
    }
    setServerError('')
    try {
      const form = new FormData()
      form.append('name', data.name)
      form.append('type', data.type)
      form.append('edrpou', data.edrpou)
      form.append('contactPerson', data.contactPerson)
      form.append('email', data.email)
      form.append('password', data.password)
      form.append('document', file)
      await registerOrganization(form)
      navigate('/login', { state: { pendingVerification: true } })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setServerError(e?.response?.data?.message ?? 'Помилка реєстрації. Спробуйте ще раз.')
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="text-2xl font-bold text-white">
            Volon<span className="text-accent">ti</span>
          </Link>
        </div>

        <div className="rounded-2xl bg-surface border border-white/[0.06] p-8">
          <h2 className="mb-6 text-xl font-bold text-white">Реєстрація організації</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Назва організації"
              placeholder="Карітас Україна"
              error={errors.name?.message}
              {...register('name')}
            />

            {/* Type dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white">Тип організації</label>
              <select
                className={`w-full rounded-xl bg-surface border ${errors.type ? 'border-red-500' : 'border-white/[0.08]'} px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent transition-colors`}
                {...register('type')}
              >
                <option value="">Оберіть тип</option>
                {ORG_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.type && <p className="text-xs text-red-400">{errors.type.message}</p>}
            </div>

            <Input
              label="ЄДРПОУ"
              placeholder="12345678"
              maxLength={8}
              error={errors.edrpou?.message}
              {...register('edrpou')}
            />

            <Input
              label="Контактна особа"
              placeholder="Марія Іваненко"
              error={errors.contactPerson?.message}
              {...register('contactPerson')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="org@example.com"
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

            {/* PDF upload zone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white">
                Витяг з держреєстру (PDF)
              </label>
              <div
                className={`rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-accent bg-accent/5'
                    : fileError
                    ? 'border-red-500'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
              >
                <svg className="h-8 w-8 text-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                {file ? (
                  <p className="text-sm text-accent font-medium">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-white/60 text-center">
                      Перетягніть PDF або{' '}
                      <span className="text-accent">натисніть для вибору</span>
                    </p>
                    <p className="text-xs text-muted">Максимум {MAX_PDF_MB} МБ</p>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                }}
              />
              {fileError && <p className="text-xs text-red-400">{fileError}</p>}
            </div>

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
              Подати заявку
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted">
            Акаунт буде активовано після перевірки адміністратором
          </p>

          <p className="mt-3 text-center text-sm text-muted">
            Вже маєте акаунт?{' '}
            <Link to="/login" className="text-accent hover:underline">
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
