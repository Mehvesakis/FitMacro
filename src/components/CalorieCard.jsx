import ProgressBar from './ProgressBar'
import { toNumber } from '../utils/nutritionUtils'

export default function CalorieCard({ consumedCalories, dailyCalorieTarget }) {
  const goal = toNumber(dailyCalorieTarget)
  const consumed = toNumber(consumedCalories)
  const remaining = goal - consumed
  const displayRemaining = Math.max(remaining, 0)

  return (
    <section className="mt-5 rounded-3xl border-2 border-mint-200 bg-gradient-to-br from-white to-mint-50 p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Alınan Kalori
          </p>
          <p className="mt-1 leading-none">
            <span className="text-5xl font-extrabold text-kalori-green">
              {consumed}
            </span>
            <span className="ml-1 text-lg font-semibold text-kalori-green">
              kcal
            </span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold text-gray-400">Günlük Hedef</p>
          <p className="mt-1 text-base font-bold text-gray-700">
            {goal} kcal
          </p>
        </div>
      </div>

      <div className="mt-5">
        <ProgressBar value={consumed} max={goal} color="#2D9F5A" />
      </div>

      <p className="mt-3 text-sm font-semibold text-kalori-orange">
        {remaining > 0
          ? `${displayRemaining} kcal kaldı — devam et! 💪`
          : remaining === 0
            ? 'Hedefe ulaştın! 🎯'
            : `${Math.abs(remaining)} kcal hedefin üzerinde`}
      </p>
    </section>
  )
}
