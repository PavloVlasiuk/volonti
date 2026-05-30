import { Link } from 'react-router-dom'

export default function ProfileSetupStrip() {
  return (
    <div className="mb-6 rounded-xl border border-accent/30 bg-accent/[0.07] px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              Завершіть профіль, щоб отримувати персональні рекомендації
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Поки ви не обрали інтереси, алгоритму нема на чому будувати підбір —
              стрічка показує ініціативи за новизною. Додайте напрямки, місто та
              формат, і ми підберемо найкращі збіги для вас.
            </p>
          </div>
        </div>
        <Link
          to="/profile"
          className="shrink-0 rounded-full bg-accent px-5 py-2 text-center text-sm font-semibold text-bg transition-colors hover:bg-accent/90"
        >
          Заповнити профіль
        </Link>
      </div>
    </div>
  )
}
