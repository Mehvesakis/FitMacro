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
              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-card transition-all hover:shadow-md"
            >
              <div>
                <p className="text-sm font-semibold text-gray-800">{meal.name}</p>
                <p className="text-xs text-gray-400">
                  {formatTime(meal.addedAt)} · {meal.calories} kcal
                </p>
              </div>
              <span className="text-xs font-bold text-kalori-green">
                {meal.protein}g P
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-8">
          <span className="mb-2 text-2xl">🍽️</span>
          <p className="text-sm font-medium text-gray-400">
            {isToday(selectedDate)
              ? 'Bugün henüz öğün eklenmedi.'
              : 'Bu gün için kayıtlı öğün yok.'}
          </p>
        </div>
      )}
    </section>
  )
}