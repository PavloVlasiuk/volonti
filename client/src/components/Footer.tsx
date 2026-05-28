import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-bg mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <Link to="/" className="text-xl font-bold">
              Volon<span className="text-accent">ti</span>
            </Link>
            <p className="mt-1 text-sm text-muted leading-relaxed">
              Платформа для з'єднання волонтерів і організацій.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Платформа</h4>
            <ul className="space-y-1">
              <li>
                <Link
                  to="/initiatives"
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Ініціативи
                </Link>
              </li>
              <li>
                <Link
                  to="/register/volunteer"
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Стати волонтером
                </Link>
              </li>
              <li>
                <Link
                  to="/register/organization"
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Зареєструвати організацію
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Контакти</h4>
            <ul className="space-y-1">
              <li>
                <a
                  href="mailto:support@volonti.ua"
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  support@volonti.ua
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/volonti_ua"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted hover:text-white transition-colors"
                >
                  Telegram: @volonti_ua
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 border-t border-white/[0.06] pt-3 text-xs text-muted">
          © 2026 VolonTi · ГО «Волонті»
        </div>
      </div>
    </footer>
  )
}
