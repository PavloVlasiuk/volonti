import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Logo() {
  return (
    <Link to="/" className="text-xl font-bold tracking-tight">
      Volon<span className="text-accent">ti</span>
    </Link>
  )
}

const baseLink = 'text-sm text-white/70 hover:text-white transition-colors'
const highlightLink =
  'text-sm font-semibold text-accent hover:text-accent/80 transition-colors'

interface MiddleProps {
  onNavigate?: () => void
}

function GuestMiddle({ onNavigate }: MiddleProps) {
  return (
    <>
      <Link to="/initiatives" onClick={onNavigate} className={baseLink}>
        Ініціативи
      </Link>
      <Link to="/register/organization" onClick={onNavigate} className={baseLink}>
        Для організацій
      </Link>
      <a href="/#about" onClick={onNavigate} className={baseLink}>
        Про платформу
      </a>
    </>
  )
}

function VolunteerMiddle({ onNavigate }: MiddleProps) {
  return (
    <>
      <NavLink
        to="/initiatives"
        onClick={onNavigate}
        className={({ isActive }) =>
          isActive ? highlightLink : baseLink
        }
      >
        Ініціативи
      </NavLink>
      <NavLink
        to="/feed"
        onClick={onNavigate}
        className={({ isActive }) =>
          `${isActive ? highlightLink : highlightLink} relative`
        }
      >
        Моя стрічка
        <span className="absolute -right-2 -top-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
      </NavLink>
      <NavLink
        to="/applications"
        onClick={onNavigate}
        className={({ isActive }) =>
          isActive ? highlightLink : baseLink
        }
      >
        Заявки
      </NavLink>
    </>
  )
}

function Middle({
  isAuthenticated,
  isVolunteer,
  isOrganization,
  isAdmin,
  onNavigate,
}: {
  isAuthenticated: boolean
  isVolunteer: boolean
  isOrganization: boolean
  isAdmin: boolean
  onNavigate?: () => void
}) {
  if (!isAuthenticated) return <GuestMiddle onNavigate={onNavigate} />
  if (isVolunteer) return <VolunteerMiddle onNavigate={onNavigate} />
  // Organizations and admins have no middle links — their actions live on the right.
  if (isOrganization || isAdmin) return null
  return null
}

export default function Navbar() {
  const { isAuthenticated, isVolunteer, isOrganization, isAdmin, logout } =
    useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Logo />

          {/* Desktop center links */}
          <div className="hidden md:flex items-center gap-8">
            <Middle
              isAuthenticated={isAuthenticated}
              isVolunteer={isVolunteer}
              isOrganization={isOrganization}
              isAdmin={isAdmin}
            />
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-white/30 px-4 py-1.5 text-sm text-white hover:border-white transition-colors"
                >
                  Увійти
                </Link>
                <Link
                  to="/register/volunteer"
                  className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-bg hover:bg-accent/90 transition-colors"
                >
                  Реєстрація
                </Link>
              </>
            )}

            {isVolunteer && (
              <>
                <Link to="/profile" className={baseLink}>
                  Профіль
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Вийти
                </button>
              </>
            )}

            {isOrganization && (
              <>
                <Link to="/dashboard" className={baseLink}>
                  Дашборд
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Вийти
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <Link to="/admin/organizations" className={baseLink}>
                  Верифікація
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Вийти
                </button>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Меню"
          >
            {menuOpen ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-bg px-4 py-4 flex flex-col gap-4">
          <Middle
            isAuthenticated={isAuthenticated}
            isVolunteer={isVolunteer}
            isOrganization={isOrganization}
            isAdmin={isAdmin}
            onNavigate={() => setMenuOpen(false)}
          />
          {!isAuthenticated && (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
              <Link
                to="/login"
                className="text-sm text-white/70"
                onClick={() => setMenuOpen(false)}
              >
                Увійти
              </Link>
              <Link
                to="/register/volunteer"
                className="text-sm text-accent font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Реєстрація
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
              {isVolunteer && (
                <Link
                  to="/profile"
                  className="text-sm text-white/70"
                  onClick={() => setMenuOpen(false)}
                >
                  Профіль
                </Link>
              )}
              {isOrganization && (
                <Link
                  to="/dashboard"
                  className="text-sm text-white/70"
                  onClick={() => setMenuOpen(false)}
                >
                  Дашборд
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/organizations"
                  className="text-sm text-white/70"
                  onClick={() => setMenuOpen(false)}
                >
                  Верифікація
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout()
                  setMenuOpen(false)
                }}
                className="text-left text-sm text-muted"
              >
                Вийти
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
