import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import InitiativeCard from '../components/InitiativeCard'
import Spinner from '../components/Spinner'
import { getInitiatives } from '../api/initiatives.api'
import { getCategories } from '../api/categories.api'

// const METRICS = [
//   { value: '4 800+', label: 'Волонтери' },
//   { value: '320', label: 'Організацій' },
//   { value: '1 200+', label: 'Відкриті ініціативи' },
//   { value: '24', label: 'Міста' },
// ]

const HOW_STEPS = [
  {
    num: '01',
    title: 'Верифікація організацій',
    desc: 'Кожна НДО перевіряється з нуля, їх файли та факти — лише реальна робота.',
  },
  {
    num: '02',
    title: 'Алгоритм підбору',
    desc: 'Система аналізує ваш профіль і пропонує ініціативи, де прийметься найбільша користь.',
  },
  {
    num: '03',
    title: 'Миттєва заявка',
    desc: 'Один профіль — одна заявка. Організація отримує повідомлення одразу.',
  },
]

function HeroSection() {
  return (
    <section className="pt-28 pb-20 px-4">
      <div className="mx-auto max-w-7xl">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-accent/80">
          Платформа активна під час війни
        </p>

        <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Волонтерство, яке{' '}
          <em className="not-italic text-accent">справді</em> досягає мети
        </h1>

        <p className="mb-8 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
          Підключайтесь до верифікованих організацій, що потребують вашої допомоги зараз.
          Без зайвих кроків — тільки реальна дія.
        </p>

        <div className="flex flex-wrap gap-3 mb-12">
          <Link
            to="/register/volunteer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent/90 transition-colors"
          >
            Хочу волонтерити
          </Link>
          <Link
            to="/register/organization"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40 hover:bg-white/5 transition-colors"
          >
            Я з організації
          </Link>
        </div>

        {/* <div className="flex flex-wrap gap-8">
          {METRICS.map(m => (
            <div key={m.label}>
              <p className="text-2xl font-bold text-white">{m.value}</p>
              <p className="text-xs text-muted">{m.label}</p>
            </div>
          ))}
        </div> */}
      </div>
    </section>
  )
}

function AudienceCards() {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Volunteer card */}
        <div className="rounded-2xl bg-accent/10 border border-accent/20 p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-accent">
            Для волонтерів
          </p>
          <h2 className="mb-3 text-2xl font-bold text-white">
            Знайдіть справу, яка вас торкає
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-white/60">
            Створіть профіль за хвилину. Алгоритм підбирає ініціативи за вашими інтересами,
            графіком та містом. Подача заявки — один клік.
          </p>
          <Link
            to="/register/volunteer"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent/90 transition-colors"
          >
            Створити профіль →
          </Link>
        </div>

        {/* Organization card */}
        <div className="rounded-2xl bg-surface border border-white/[0.06] p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
            Для організацій
          </p>
          <h2 className="mb-3 text-2xl font-bold text-white">
            Знайдіть людей, яким не байдуже
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-white/60">
            Безкоштовний інструмент для НДО, фондів та кризових центрів.
            Публікуйте ініціативи, керуйте заявками та координуйте команду.
          </p>
          <Link
            to="/register/organization"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:border-white/50 hover:bg-white/5 transition-colors"
          >
            Зареєструвати НДО
          </Link>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-muted">
          Можливості платформи
        </p>
        <h2 className="mb-16 text-center text-3xl font-bold text-white sm:text-4xl">
          Створено для тих, хто діє
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {HOW_STEPS.map(step => (
            <div key={step.num} className="rounded-xl bg-surface border border-white/[0.06] p-6">
              <p className="mb-4 text-3xl font-bold text-accent/30">{step.num}</p>
              <h3 className="mb-2 text-base font-semibold text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoriesSection() {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  if (!categories.length) return null

  return (
    <section className="py-16 px-4 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">
          Знайдіть напрям, близький вам
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/initiatives?categoryId=${cat.id}`}
              className="rounded-full border border-white/10 bg-surface px-5 py-2 text-sm text-white/70 hover:border-accent/40 hover:text-accent transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedInitiatives() {
  const { data, isLoading } = useQuery({
    queryKey: ['initiatives', { page: 1, limit: 3 }],
    queryFn: () => getInitiatives({ page: 1, limit: 3 }),
  })
  const initiatives = data?.items ?? []

  return (
    <section className="py-20 px-4 border-t border-white/[0.04]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Останні ініціативи</h2>
          <Link to="/initiatives" className="text-sm font-medium text-accent hover:underline">
            Дивитися всі →
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : initiatives.length === 0 ? (
          <p className="text-center text-muted py-12">Ініціативи не знайдено</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {initiatives.map(initiative => (
              <InitiativeCard key={initiative.id} initiative={initiative} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function CtaBanner() {
  return (
    <section className="py-16 px-4 bg-accent">
      <div className="mx-auto max-w-7xl flex flex-col items-center gap-6 md:flex-row md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-bg sm:text-3xl">Готові зробити внесок?</h2>
          <p className="mt-1 text-sm text-bg/70">Приєднуйтесь до тисяч волонтерів та організацій</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/register/volunteer"
            className="rounded-full bg-bg px-6 py-3 text-sm font-semibold text-accent hover:bg-bg/90 transition-colors"
          >
            Стати волонтером
          </Link>
          <Link
            to="/register/organization"
            className="rounded-full border border-bg/30 px-6 py-3 text-sm font-semibold text-bg hover:bg-bg/10 transition-colors"
          >
            Додати організацію
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <AudienceCards />
        <HowItWorks />
        <CategoriesSection />
        <FeaturedInitiatives />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
