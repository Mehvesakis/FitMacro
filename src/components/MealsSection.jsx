const legendItems = [
  {
    dot: true,
    icon: (
      <svg
        className="h-4 w-4 text-kalori-orange"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M4 12a8 8 0 0 1 13.5-5.7" strokeLinecap="round" />
        <path d="M4 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 12a8 8 0 0 1-13.5 5.7" strokeLinecap="round" />
        <path d="M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    label: 'Alternatif gör (sağlıklı)',
  },
  {
    dot: true,
    icon: (
      <svg
        className="h-4 w-4 text-kalori-orange"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          d="M12 9v4m0 4h.01M10.3 3.9 2.1 18.1A2 2 0 0 0 3.9 21h16.2a2 2 0 0 0 1.8-2.9L13.7 3.9a2 2 0 0 0-3.4 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    label: 'Otomatik uyarı',
  },
]

import { formatDisplayDate, isToday } from '../utils/dateUtils'

function formatTime(date) {
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MealsSection({ meals, selectedDate }) {
  const sectionTitle = isToday(selectedDate)
    ? 'Bugünkü Öğünler'
    : `${formatDisplayDate(selectedDate)} Öğünleri`

  return (
    <section className="mt-6">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
        {sectionTitle}
      </h2>

      {meals.length > 0 ? (
        <ul className="mb-4 flex flex-col gap-2">
          {meals.map((meal) => (
            <li
              key={meal.id}
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-card"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">{meal.name}</p>
                <p className="text-xs text-gray-400">
                  {formatTime(meal.addedAt)} · {meal.calories} kcal
                </p>
              </div>
              <span className="text-xs font-semibold text-kalori-green">
                {meal.protein}g P
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-gray-400">
          {isToday(selectedDate)
            ? 'Henüz öğün eklenmedi.'
            : 'Bu gün için kayıtlı öğün yok.'}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {legendItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 text-sm text-gray-500"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-kalori-orange" />
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
