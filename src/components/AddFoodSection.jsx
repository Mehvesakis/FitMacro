import { useEffect, useRef, useState, useMemo } from 'react'
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
import { loadMealsByDate } from '../utils/storage'

// Sabit (Fallback) Favoriler (Sadece isim ve makro bilgileri)
const FAVORITE_MEALS = [
  { id: 'fav1', name: 'Yulaf & Chia Karışımı', calories: 280, protein: 12, carbs: 45, fat: 8, fiber: 10 },
  { id: 'fav2', name: 'Quark & Orman Meyveleri', calories: 150, protein: 15, carbs: 18, fat: 2, fiber: 4 },
  { id: 'fav3', name: 'Tavuk Göğsü & Bulgur', calories: 420, protein: 45, carbs: 40, fat: 6, fiber: 5 },
  { id: 'fav4', name: 'Ton Balıklı Yeşil Mercimek', calories: 380, protein: 35, carbs: 30, fat: 12, fiber: 12 },
  { id: 'fav5', name: '2 Yumurtalı Omlet', calories: 220, protein: 14, carbs: 2, fat: 16, fiber: 0 },
]

function CameraButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Kamera ile ekle"
      className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-mint-200 bg-mint-50 text-kalori-green shadow-card transition-all hover:bg-mint-100 hover:shadow-lg active:scale-[0.98]"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 8h2l1.5-2h9L18 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
    </button>
  )
}

function formatTime(date) {
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function DeleteButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label="Besini sil" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
      </svg>
    </button>
  )
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin text-kalori-green" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  )
}

function AlternativeButton({ onClick, isLoading, isOpen }) {
  if (isOpen) return null
  return (
    <button type="button" onClick={onClick} disabled={isLoading} className="flex shrink-0 items-center gap-1.5 rounded-xl border border-mint-200 bg-mint-50 px-2.5 py-1.5 text-xs font-semibold text-kalori-green transition-colors hover:bg-mint-100 disabled:cursor-wait disabled:opacity-80">
      {isLoading ? <><Spinner /><span>Yükleniyor...</span></> : '🔄 Alternatif Gör'}
    </button>
  )
}

function AlternativeCard({ recipe, onClose }) {
  const isWarning = recipe.type === 'warning'
  const badgeClass = isWarning ? 'text-orange-600' : 'text-kalori-green'
  return (
    <div className={`relative mt-2 rounded-2xl border-2 bg-gradient-to-br from-white p-4 pr-10 shadow-card ${isWarning ? 'border-orange-200 to-orange-50/40' : 'border-mint-200 to-mint-50'}`}>
      <button type="button" onClick={onClose} aria-label="Alternatifi kapat" className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white hover:text-gray-600">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
      </button>
      <p className={`text-xs font-bold uppercase tracking-wider ${badgeClass}`}>{recipe.badge ?? 'Pratik Alternatif'}</p>
      <h4 className="mt-1 text-sm font-bold text-gray-800">{recipe.title}</h4>
      <p className="mt-2 text-xs leading-relaxed text-gray-600">{recipe.description}</p>
      <p className="mt-3 text-xs font-medium text-gray-400">🍳 Tek tava · ⚡ {recipe.time} · 💪 Yüksek protein</p>
    </div>
  )
}

function UnhealthyWarning({ onShowAlternative, isLoading, isAlternativeOpen }) {
  return (
    <div className="mt-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5">
      <p className="text-xs font-medium leading-relaxed text-orange-700">🚨 Bu besin yüksek oranda rafine şeker/yağ içerir. Sağlıklı bir alternatif denemek ister misin?</p>
      {!isAlternativeOpen && (
        <button type="button" onClick={onShowAlternative} disabled={isLoading} className="mt-2 flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-kalori-green transition-colors hover:bg-mint-50 disabled:cursor-wait">
          {isLoading ? <><Spinner /><span>Yükleniyor...</span></> : '🔄 Alternatif Gör'}
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

  const lastDashIndex = meal.name.lastIndexOf(' - ')
  const mealTitle = lastDashIndex !== -1 ? meal.name.substring(0, lastDashIndex) : meal.name

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

  return (
    <li className="flex flex-col">
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-card">
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-mint-50 text-xl">🍽️</span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate text-sm font-bold text-gray-800">{mealTitle}</p>
            <span className="shrink-0 text-[10px] font-semibold text-gray-400">{formatTime(meal.addedAt)}</span>
          </div>
          {meal.calories > 0 && <p className="text-xs font-bold text-gray-500">{meal.calories} kcal</p>}
          {meal.calories > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold tracking-wide">
              <span className="rounded bg-mint-50 px-2 py-0.5 text-kalori-green">{meal.protein}g P</span>
              <span className="rounded bg-orange-50 px-2 py-0.5 text-orange-500">{meal.carbs}g K</span>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-500">{meal.fat}g Y</span>
            </div>
          )}
        </div>
        <div className="ml-1 flex shrink-0 items-center gap-1.5">
          {!isUnhealthy && <AlternativeButton onClick={handleShowAlternative} isLoading={isLoading} isOpen={isOpen} />}
          <DeleteButton onClick={() => onRemove(meal.id)} />
        </div>
      </div>
      {isUnhealthy && <UnhealthyWarning onShowAlternative={handleShowAlternative} isLoading={isLoading} isAlternativeOpen={isOpen} />}
      {isOpen && recipe && <AlternativeCard recipe={recipe} onClose={() => setIsOpen(false)} />}
    </li>
  )
}

export default function AddFoodSection({ meals, selectedDate, onAddMeal, onRemoveMeal }) {
  const [query, setQuery] = useState('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // DİNAMİK FAVORİLER ALGORİTMASI
  const dynamicFavorites = useMemo(() => {
    try {
      const allData = loadMealsByDate() || {}
      const frequencyMap = {}
      const latestMealMap = {}

      Object.values(allData).forEach((dayMeals) => {
        dayMeals.forEach((meal) => {
          const nameKey = meal.name 
          frequencyMap[nameKey] = (frequencyMap[nameKey] || 0) + 1
          if (!latestMealMap[nameKey]) latestMealMap[nameKey] = meal
        })
      })

      const sortedNames = Object.keys(frequencyMap).sort((a, b) => frequencyMap[b] - frequencyMap[a])
      
      const topMeals = sortedNames.slice(0, 5).map((name) => {
        const m = latestMealMap[name]
        return {
          id: `dyn-${m.id}`,
          name: m.name,
          calories: m.calories,
          protein: m.protein || 0,
          carbs: m.carbs || 0,
          fat: m.fat || 0,
          fiber: m.fiber || 0
        }
      })

      if (topMeals.length < 5) {
        const existingNames = topMeals.map(m => m.name)
        const needed = 5 - topMeals.length
        const fallback = FAVORITE_MEALS.filter(m => !existingNames.includes(m.name)).slice(0, needed)
        return [...topMeals, ...fallback]
      }

      return topMeals
    } catch (error) {
      return FAVORITE_MEALS
    }
  }, [meals]) 

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
      console.error('[FitMacro] Besin analizi başarısız:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  function handleQuickAdd(foodItem) {
    const cleanName = foodItem.name.replace(/\s*-\s*\d+\s*kcal/i, '')
    const newMeal = {
      id: crypto.randomUUID(),
      name: cleanName,
      calories: foodItem.calories,
      protein: foodItem.protein || 0,
      carbs: foodItem.carbs || 0,
      fat: foodItem.fat || 0,
      fiber: foodItem.fiber || 0,
      addedAt: new Date(),
      matchedKey: cleanName,
      searchInput: cleanName,
    }
    onAddMeal(newMeal)
  }

  return (
    <section className="mt-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {!isToday(selectedDate) && (
        <div className="mb-4 rounded-2xl border border-mint-200 bg-mint-50 px-4 py-3 text-xs font-medium text-kalori-green">
          {formatDisplayDate(selectedDate)} gününe besin ekliyorsun
        </div>
      )}

      {/* 1. YAPAY ZEKA / KAMERA İLE ARAMA ÇUBUĞU */}
      <form onSubmit={handleAdd} className="mb-8 flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ne yedin? (örn: Yulaf, Cips...)"
          disabled={isAnalyzing}
          className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-kalori-green focus:outline-none focus:ring-2 focus:ring-mint-100 disabled:opacity-60"
        />
        <CameraButton onClick={() => setIsCameraOpen(true)} />
        <button
          type="submit"
          disabled={isAnalyzing}
          className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-kalori-green px-3 py-3.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-mint-700 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 sm:px-4"
        >
          {isAnalyzing ? <><Spinner /><span className="hidden sm:inline">Analiz...</span></> : 'Ekle'}
        </button>
      </form>

      {isAnalyzing && (
        <div className="-mt-6 mb-8 flex items-center justify-center">
          <p className="animate-pulse text-xs font-medium text-kalori-green">
            Yapay zeka tabağındaki makroları hesaplıyor...
          </p>
        </div>
      )}

      {/* 2. DİNAMİK FAVORİLER (HIZLI EKLE) - KOMPAKT YATAY KARUSEL */}
      <div className="mb-8">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Sık Tüketilenler
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {dynamicFavorites.map((meal) => {
            const cleanTitle = meal.name.replace(/\s*-\s*\d+\s*kcal/i, '')
            return (
              <div
                key={meal.id}
                className="flex w-[145px] shrink-0 snap-start flex-col justify-between rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all hover:border-mint-200"
              >
                <p className="line-clamp-2 text-sm font-bold leading-snug text-gray-800">
                  {cleanTitle}
                </p>
                
                <div className="mt-3 flex items-end justify-between border-t border-gray-50 pt-2">
                  <span className="text-xs font-bold text-gray-400">
                    {meal.calories} kcal
                  </span>
                  <button
                    onClick={() => handleQuickAdd(meal)}
                    aria-label="Hızlı ekle"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-mint-50 text-kalori-green transition-all hover:scale-110 hover:bg-kalori-green hover:text-white active:scale-95"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onAddMeal={onAddMeal} />

      {/* 3. SON EKLENEN ÖĞÜNLER */}
      <div className="mt-6">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          {isToday(selectedDate) ? 'Son Eklenenler' : 'Seçili Günün Öğünleri'}
        </h2>
        {meals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 px-4 py-10 text-center shadow-card">
            <p className="text-sm font-medium text-gray-400">Henüz besin eklenmedi</p>
            <p className="mt-1 text-xs text-gray-300">Yukarıdan veya favorilerden besin ekleyebilirsin</p>
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