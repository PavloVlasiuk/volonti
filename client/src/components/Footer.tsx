import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-bg mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-bold">
              Volon<span className="text-accent">ti</span>
            </Link>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Платформа для з'єднання волонтерів і організацій під час війни.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Платформа</h4>
            <ul className="space-y-2">
              <li><Link to="/initiatives" className="text-sm text-muted hover:text-white transition-colors">Ініціативи</Link></li>
              <li><Link to="/register/volunteer" className="text-sm text-muted hover:text-white transition-colors">Стати волонтером</Link></li>
              <li><Link to="/feed" className="text-sm text-muted hover:text-white transition-colors">Моя стрічка</Link></li>
            </ul>
          </div>

          {/* For orgs */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Організаціям</h4>
            <ul className="space-y-2">
              <li><Link to="/register/organization" className="text-sm text-muted hover:text-white transition-colors">Зареєструвати НДО</Link></li>
              <li><Link to="/dashboard" className="text-sm text-muted hover:text-white transition-colors">Дашборд</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Підтримка</h4>
            <ul className="space-y-2">
              <li><a href="mailto:support@volonti.ua" className="text-sm text-muted hover:text-white transition-colors">support@volonti.ua</a></li>
              <li><a href="#" className="text-sm text-muted hover:text-white transition-colors">Довідка</a></li>
              <li><a href="#" className="text-sm text-muted hover:text-white transition-colors">Контакти</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted">
          <span>© 2026 VolonTi · ГО «Волонті»</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Довідка</a>
            <a href="#" className="hover:text-white transition-colors">Контакти</a>
            <a href="#" className="hover:text-white transition-colors">Політика конфіденційності</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
