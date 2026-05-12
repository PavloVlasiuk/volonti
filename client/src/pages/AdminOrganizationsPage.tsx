import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Badge from '../components/Badge'
import Card from '../components/Card'
import Spinner from '../components/Spinner'
import { getOrganizations } from '../api/admin.api'
import { formatDate } from '../utils/formatDate'
import type { OrgStatus } from '../types/organization.types'

type Tab = 'PENDING' | 'VERIFIED' | 'REJECTED'

const TABS: { value: Tab; label: string }[] = [
  { value: 'PENDING', label: 'Очікують' },
  { value: 'VERIFIED', label: 'Верифіковані' },
  { value: 'REJECTED', label: 'Відхилені' },
]

const STATUS_BADGE: Record<Tab, 'pending' | 'verified' | 'rejected'> = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
}

const STATUS_LABEL: Record<Tab, string> = {
  PENDING: 'Очікує',
  VERIFIED: 'Верифіковано',
  REJECTED: 'Відхилено',
}

export default function AdminOrganizationsPage() {
  const [tab, setTab] = useState<Tab>('PENDING')

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['admin-orgs', tab],
    queryFn: () => getOrganizations(tab as OrgStatus),
  })

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
          <h1 className="mb-8 text-3xl font-bold text-white">Верифікація організацій</h1>

          {/* Filter tabs */}
          <div className="mb-6 flex gap-1 border-b border-white/[0.08]">
            {TABS.map(t => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === t.value
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : orgs.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-3 text-center">
              <p className="text-lg font-semibold text-white">Організацій немає</p>
              <p className="text-sm text-muted">
                {tab === 'PENDING'
                  ? 'Немає організацій, що очікують верифікації.'
                  : tab === 'VERIFIED'
                    ? 'Немає верифікованих організацій.'
                    : 'Немає відхилених організацій.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orgs.map(org => (
                <Card
                  key={org.id}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{org.name}</span>
                      <Badge variant={STATUS_BADGE[tab]}>
                        {STATUS_LABEL[tab]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted">
                      ЄДРПОУ {org.edrpou} · {org.contactPerson}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Подано: {formatDate(org.createdAt)}
                    </p>
                  </div>

                  <Link
                    to={`/admin/organizations/${org.id}`}
                    className="shrink-0 text-sm font-medium text-accent hover:underline whitespace-nowrap"
                  >
                    Переглянути →
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
