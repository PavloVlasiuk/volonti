import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import { getOrganization, verifyOrganization, rejectOrganization } from '../api/admin.api'
import { formatDate } from '../utils/formatDate'
import type { OrgType } from '../types/organization.types'

const ORG_TYPE_LABEL: Record<OrgType, string> = {
  NGO: 'НГО',
  CHARITY: 'Благодійний фонд',
  MUNICIPAL: 'Муніципальна',
  CRISIS_CENTER: 'Кризовий центр',
}

const STATUS_BADGE = {
  PENDING: 'pending' as const,
  VERIFIED: 'verified' as const,
  REJECTED: 'rejected' as const,
}

const STATUS_LABEL = {
  PENDING: 'Очікує',
  VERIFIED: 'Верифіковано',
  REJECTED: 'Відхилено',
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <span className="w-36 shrink-0 text-sm text-muted">{label}</span>
      <span className="text-sm text-white">{value ?? '—'}</span>
    </div>
  )
}

export default function AdminOrganizationReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [reason, setReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  const { data: org, isLoading } = useQuery({
    queryKey: ['admin-org', id],
    queryFn: () => getOrganization(id!),
    enabled: !!id,
  })

  const verifyMutation = useMutation({
    mutationFn: () => verifyOrganization(id!),
    onSuccess: () => navigate('/admin/organizations'),
  })

  const rejectMutation = useMutation({
    mutationFn: () => rejectOrganization(id!, reason),
    onSuccess: () => navigate('/admin/organizations'),
  })

  function handleReject() {
    if (!reason.trim()) {
      setRejectError('Вкажіть причину відхилення')
      return
    }
    setRejectError('')
    rejectMutation.mutate()
  }

  const isDecided = org?.status === 'VERIFIED' || org?.status === 'REJECTED'

  const documentUrl = org?.documentUrl
    ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${org.documentUrl}`
    : null

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

  if (!org) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pt-20 gap-4">
          <p className="text-white text-lg">Організацію не знайдено</p>
          <Link to="/admin/organizations" className="text-sm text-accent hover:underline">
            ← До списку
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
            <Link to="/admin/organizations" className="hover:text-accent transition-colors">
              Верифікація
            </Link>
            <span>→</span>
            <span className="text-white/70 line-clamp-1 max-w-xs">{org.name}</span>
          </nav>

          {/* Title row */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <h1 className="text-2xl font-bold text-white">{org.name}</h1>
            <Badge variant={STATUS_BADGE[org.status]}>
              {STATUS_LABEL[org.status]}
            </Badge>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 lg:items-start">
            {/* Left: details */}
            <Card className="flex-1 p-6 flex flex-col gap-4">
              <DetailRow label="Тип організації" value={ORG_TYPE_LABEL[org.type as OrgType]} />
              <DetailRow label="ЄДРПОУ" value={org.edrpou} />
              <DetailRow label="Контактна особа" value={org.contactPerson} />
              <DetailRow label="Email" value={org.email} />
              <DetailRow label="Дата подачі" value={formatDate(org.createdAt)} />

              {org.status === 'REJECTED' && org.rejectionReason && (
                <div className="pt-2 border-t border-white/[0.08]">
                  <p className="text-xs text-muted mb-1">Причина відхилення</p>
                  <p className="text-sm text-red-400">{org.rejectionReason}</p>
                </div>
              )}

              {documentUrl && (
                <div className="pt-2 border-t border-white/[0.08]">
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Переглянути витяг ↗
                  </a>
                </div>
              )}
            </Card>

            {/* Right: action card */}
            <div className="w-full lg:w-72 lg:shrink-0">
              <Card className="p-6 flex flex-col gap-4">
                {isDecided ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted">Рішення вже прийнято.</p>
                    <Link
                      to="/admin/organizations"
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      ← До черги
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Verify */}
                    <Button
                      className="w-full"
                      onClick={() => verifyMutation.mutate()}
                      loading={verifyMutation.isPending}
                      disabled={rejectMutation.isPending}
                    >
                      Верифікувати
                    </Button>

                    <div className="border-t border-white/[0.08]" />

                    {/* Reject */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-white">
                        Причина відхилення
                      </label>
                      <textarea
                        value={reason}
                        onChange={e => { setReason(e.target.value); setRejectError('') }}
                        rows={3}
                        placeholder="Вкажіть причину..."
                        className={`w-full rounded-xl bg-bg border ${rejectError ? 'border-red-500' : 'border-white/[0.08]'} px-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none`}
                      />
                      {rejectError && (
                        <p className="text-xs text-red-400">{rejectError}</p>
                      )}
                      <Button
                        variant="outlined"
                        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                        onClick={handleReject}
                        loading={rejectMutation.isPending}
                        disabled={verifyMutation.isPending}
                      >
                        Відхилити
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
