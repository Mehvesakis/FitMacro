import { useEffect, useRef, useState } from 'react'
import CameraModal from './CameraModal'
import { getFoodCategory } from '../utils/foodUtils'
import {
  analyzeFoodWithAI,
  createMealFromAIAnalysis,
} from '../services/aiService'
import { formatDisplayDate, isToday } from '../utils/dateUtils'
import {
  ALTERNATIVE_LOADING_MS,
  getAlternativeRecipe,
} from '../utils/alternativeRecipes'

function CameraButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Kamera ile ekle"
      className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-mint-200 bg-mint-50 text-kalori-green shadow-card transition-all hover:bg-mint-100 hover:shadow-lg active:scale-[0.98]"
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path
          d="M4 8h2l1.5-2h9L18 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
    </button>
  )
}

function formatTime(date) {
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DeleteButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Besini sil"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function Spinner() {
  return (
    <svg
      className="h-3.5 w-3.5 animate-spin text-kalori-green"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  )
}

function AlternativeButton({ onClick, isLoading, isOpen }) {
  if (isOpen) return null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex shrink-0 items-center gap-1.5 rounded-xl border border-mint-200 bg-mint-50 px-2.5 py-1.5 text-xs font-semibold text-kalori-green transition-colors hover:bg-mint-100 disabled:cursor-wait disabled:opacity-80"
    >
      {isLoading ? (
        <>
          <Spinner />
          <span>Yükleniyor...</span>
        </>
      ) : (
        '🔄 Alternatif Gör'
      )}
    </button>
  )
}

function AlternativeCard({ recipe, onClose }) {
  const isWarning = recipe.type === 'warning'
  const badgeClass = isWarning
    ? 'text-orange-600'
    : 'text-kalori-green'

  return (
    <div
      className={`relative rounded-2xl border-2 bg-gradient-to-br from-white p-4 pr-10 shadow-card ${
        isWarning ? 'border-orange-200 to-orange-50/40' : 'border-mint-200 to-mint-50'
      }`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Alternatifi kapat"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>

      <p className={`text-xs font-bold uppercase tracking-wider ${badgeClass}`}>
        {recipe.badge ?? 'Pratik Alternatif'}
      </p>
      <h4 className="mt-1 text-sm font-bold text-gray-800">{recipe.title}</h4>
      <p className="mt-2 text-xs leading-relaxed text-gray-600">
        {recipe.description}
      </p>
      <p className="mt-3 text-xs font-medium text-gray-400">
        🍳 Tek tava · ⚡ {recipe.time} · 💪 Yüksek protein
      </p>
    </div>
  )
}

function UnhealthyWarning({ onShowAlternative, isLoading, isAlternativeOpen }) {
  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5">
      <p className="text-xs font-medium leading-relaxed text-orange-700">
        🚨 Bu besin yüksek oranda rafine şeker/yağ içerir. Sağlıklı bir
        alternatif denemek ister misin?
      </p>
      {!isAlternativeOpen && (
        <button
          type="button"
          onClick={onShowAlternative}
          disabled={isLoading}
          className="mt-2 flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-kalori-green transition-colors hover:bg-mint-50 disabled:cursor-wait"
        >
          {isLoading ? (
            <>
              <Spinner />
              <span>Yükleniyor...</span>
            </>
          ) : (
            '🔄 Alternatif Gör'
          )}
        </button>
      )}
    </div>
  )
}

function MealItem({ meal, onRemove }) {
  const categoryInput = meal.searchInput ?? meal.matchedKey ?? meal.name
  const isUnhealthy = getFoodCategory(categoryInput) === 'unhealthy'
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [recipe, setRecipe] = useState(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleShowAlternative() {
    if (isLoading) return

    setIsLoading(true)
    setIsOpen(false)

    timeoutRef.current = setTimeout(() => {
      setRecipe(getAlternativeRecipe(categoryInput))
      setIsLoading(false)
      setIsOpen(true)
    }, ALTERNATIVE_LOADING_MS)
  }

  function handleCloseAlternative() {
    setIsOpen(false)
  }

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-card">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mint-50 text-base">
          🍽️
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">
            {meal.name}
          </p>
          <p className="text-xs text-gray-400">
            {formatTime(meal.addedAt)} · Bugün
            {meal.calories > 0 && ` · ${meal.protein}g P · ${meal.carbs}g K · ${meal.fat}g Y`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {!isUnhealthy && (
            <AlternativeButton
              onClick={handleShowAlternative}
              isLoading={isLoading}
              isOpen={isOpen}
            />
          )}
          <DeleteButton onClick={() => onRemove(meal.id)} />
        </div>
      </div>

      {isUnhealthy && (
        <UnhealthyWarning
          onShowAlternative={handleShowAlternative}
          isLoading={isLoading}
          isAlternativeOpen={isOpen}
        />
      )}

      {isOpen && recipe && (
        <AlternativeCard recipe={recipe} onClose={handleCloseAlternative} />
      )}
    </li>
  )
}

export default function AddFoodSection({
  meals,
  selectedDate,
  onAddMeal,
  onRemoveMeal,
}) {
  const [query, setQuery] = useState('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  async function handleAdd(event) {
    event.preventDefault()

    const trimmed = query.trim()
    if (!trimmed || isAnalyzing) return

    setIsAnalyzing(true)

    try {
      const analysis = await analyzeFoodWithAI(trimmed)
      const meal = createMealFromAIAnalysis(analysis, trimmed)
      onAddMeal(meal)
      setQuery('')
    } catch (error) {
      console.error('[KaloriAI] Besin analizi başarısız:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function handleCameraAddMeal(meal) {
    onAddMeal(meal)
  }

  return (
    <section className="mt-5">
      {!isToday(selectedDate) && (
        <div className="mb-4 rounded-2xl border border-mint-200 bg-mint-50 px-4 py-3 text-xs font-medium text-kalori-green">
          {formatDisplayDate(selectedDate)} gününe besin ekliyorsun
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ne yedin? (örn: Yulaf, Cips...)"
          disabled={isAnalyzing}
          className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 text-sm text-gray-800 shadow-card placeholder:text-gray-400 focus:border-mint-200 focus:outline-none focus:ring-2 focus:ring-mint-100 disabled:opacity-60"
        />
        <CameraButton onClick={() => setIsCameraOpen(true)} />
        <button
          type="submit"
          disabled={isAnalyzing}
          className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-kalori-green px-3 py-3.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-mint-700 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 sm:px-4"
        >
          {isAnalyzing ? (
            <>
              <Spinner />
              <span className="hidden sm:inline">Analiz...</span>
            </>
          ) : (
            'Listeye Ekle'
          )}
        </button>
      </form>

      {isAnalyzing && (
        <p className="mt-2 text-center text-xs font-medium text-kalori-green">
          Yapay zeka düşünüyor...
        </p>
      )}

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onAddMeal={handleCameraAddMeal}
      />

      <div className="mt-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          {isToday(selectedDate) ? 'Son Eklenenler' : 'Seçili Günün Öğünleri'}
        </h2>

        {meals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 px-4 py-10 text-center shadow-card">
            <p className="text-sm font-medium text-gray-400">
              Henüz besin eklenmedi
            </p>
            <p className="mt-1 text-xs text-gray-300">
              Yukarıdan yediğin besini yazıp listeye ekleyebilirsin
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {meals.map((meal) => (
              <MealItem key={meal.id} meal={meal} onRemove={onRemoveMeal} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
