import { useMemo, useState } from 'react'
import {
  ACTIVITY_OPTIONS,
  calculateDailyCalories,
  GENDER_OPTIONS,
  getNutritionFocus,
} from '../utils/profileUtils'

const inputClassName =
  'w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 text-sm text-gray-800 shadow-card placeholder:text-gray-400 focus:border-mint-200 focus:outline-none focus:ring-2 focus:ring-mint-100'

const labelClassName = 'mb-1.5 block text-xs font-semibold text-gray-500'

export default function ProfileSection({
  profile,
  onProfileChange,
  onProfileSave,
}) {
  const [saved, setSaved] = useState(false)
  const { age, height, weight, gender, activity } = profile

  const dailyCalories = useMemo(
    () => calculateDailyCalories(profile),
    [profile],
  )

  const nutritionFocus = getNutritionFocus(activity)

  function updateProfile(field, value) {
    onProfileChange((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onProfileSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section className="mt-5">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
            Kişisel Bilgiler
          </h2>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="age" className={labelClassName}>
                Yaş
              </label>
              <input
                id="age"
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(event) => updateProfile('age', event.target.value)}
                placeholder="24"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="height" className={labelClassName}>
                Boy
              </label>
              <input
                id="height"
                type="number"
                min="100"
                max="250"
                value={height}
                onChange={(event) => updateProfile('height', event.target.value)}
                placeholder="170 cm"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="weight" className={labelClassName}>
                Güncel Kilo
              </label>
              <input
                id="weight"
                type="number"
                min="30"
                max="300"
                value={weight}
                onChange={(event) => updateProfile('weight', event.target.value)}
                placeholder="62 kg"
                className={inputClassName}
              />
            </div>
          </div>
        </div>

        <div>
          <p className={labelClassName}>Cinsiyet</p>
          <div className="grid grid-cols-2 gap-2">
            {GENDER_OPTIONS.map((option) => {
              const isSelected = gender === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateProfile('gender', option.value)}
                  className={`rounded-2xl border px-4 py-3.5 text-sm font-semibold shadow-card transition-colors ${
                    isSelected
                      ? 'border-mint-200 bg-mint-50 text-kalori-green ring-2 ring-mint-100'
                      : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="activity" className={labelClassName}>
            Yaşam Tarzı ve Hedef
          </label>
          <select
            id="activity"
            value={activity}
            onChange={(event) => updateProfile('activity', event.target.value)}
            className={`${inputClassName} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10`}
          >
            {ACTIVITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-3xl border-2 border-mint-200 bg-gradient-to-br from-white to-mint-50 p-5 shadow-card">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Hesaplanan Hedefler
          </h3>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3">
              <span className="text-sm font-medium text-gray-500">
                Günlük Kalori Hedefi
              </span>
              <span className="text-sm font-bold text-kalori-green">
                {dailyCalories ?? '—'} kcal
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3">
              <span className="text-sm font-medium text-gray-500">Odak</span>
              <span className="text-sm font-bold text-gray-800">
                {nutritionFocus}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-kalori-green py-4 text-sm font-bold text-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:bg-mint-700 hover:shadow-lg active:translate-y-0 active:scale-[0.98]"
        >
          {saved ? 'Profil Güncellendi ✓' : 'Profili Güncelle'}
        </button>
      </form>
    </section>
  )
}
