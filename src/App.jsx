import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import NavTabs from './components/NavTabs'
import CalorieCard from './components/CalorieCard'
import MacroSection from './components/MacroSection'
import WaterSection from './components/WaterSection' 
import MealsSection from './components/MealsSection'
import AddFoodSection from './components/AddFoodSection'
import ProfileSection from './components/ProfileSection'
import Onboarding from './components/Onboarding'
import PremiumDietSection from './components/PremiumDietSection.jsx'

import {
  addDaysToDateKey,
  getTodayKey,
  isToday,
} from './utils/dateUtils'
import { calculateMealTotals } from './utils/mealUtils'
import {
  calculateDailyCalories,
  calculateMacroTargets,
} from './utils/profileUtils'
import {
  loadMealsByDate,
  loadProfile,
  saveMealsByDate,
  saveProfile,
} from './utils/storage'
import { toNumber } from './utils/nutritionUtils'

function getInitialDailyCalorieTarget(profile) {
  if (!profile || !profile.name) return 2000 
  const target = profile.dailyCalorieTarget ?? calculateDailyCalories(profile)
  return toNumber(target, 2000)
}

function getMotivationQuote(consumed, target) {
  if (!target) return "Bugün hedeflerine ulaşmak için harika bir gün! 🌟"
  const ratio = consumed / target

  if (ratio === 0) return "Harika bir gün! Güne sağlıklı bir başlangıç yapmaya ne dersin? 🌅"
  if (ratio < 0.5) return "Çok iyi gidiyorsun! Hedefine emin adımlarla ilerliyorsun. 💪"
  if (ratio < 0.85) return "Harika! Günlük hedefine ulaşmak üzeresin, aynen devam! 🎯"
  if (ratio <= 1.1) return "Mükemmel! Günlük kalori hedefini tam on ikiden vurdun. 🥇"
  return "Bugün sınırı biraz aştık ama sorun değil, yarın dengeyi kurarız! 🚀"
}

export default function App() {
  const [profile, setProfile] = useState(() => loadProfile() || {})
  const [showOnboarding, setShowOnboarding] = useState(() => !profile.name)
  const [activeTab, setActiveTab] = useState('ozet')
  const [mealsByDate, setMealsByDate] = useState(() => loadMealsByDate())
  const [selectedDate, setSelectedDate] = useState(() => getTodayKey())
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(() => getInitialDailyCalorieTarget(profile))

  const [waterByDate, setWaterByDate] = useState(() => {
    const saved = localStorage.getItem('fitmacro_water')
    return saved ? JSON.parse(saved) : {}
  })

  const currentMeals = useMemo(() => mealsByDate[selectedDate] ?? [], [mealsByDate, selectedDate])
  const mealTotals = useMemo(() => calculateMealTotals(currentMeals), [currentMeals])
  const macroTargets = useMemo(() => calculateMacroTargets(dailyCalorieTarget, profile.activity, profile.diseases), [dailyCalorieTarget, profile.activity, profile.diseases])
  
  const currentWater = waterByDate[selectedDate] || 0

  useEffect(() => {
    saveMealsByDate(mealsByDate)
  }, [mealsByDate])

  useEffect(() => {
    const newTarget = calculateDailyCalories(profile)
    if (newTarget) {
      setDailyCalorieTarget(newTarget)
      saveProfile({ ...profile, dailyCalorieTarget: newTarget })
    } else {
      saveProfile({ ...profile, dailyCalorieTarget })
    }
  }, [profile])

  useEffect(() => {
    localStorage.setItem('fitmacro_water', JSON.stringify(waterByDate))
  }, [waterByDate])

  function handleAddMeal(meal) {
    setMealsByDate((prev) => ({
      ...prev,
      [selectedDate]: [meal, ...(prev[selectedDate] ?? [])],
    }))
  }

  function handleRemoveMeal(id) {
    setMealsByDate((prev) => ({
      ...prev,
      [selectedDate]: (prev[selectedDate] ?? []).filter((meal) => meal.id !== id),
    }))
  }

  function handleUpdateWater(amount) {
    setWaterByDate(prev => ({
      ...prev,
      [selectedDate]: amount
    }))
  }

  function handlePreviousDay() {
    setSelectedDate((prev) => addDaysToDateKey(prev, -1))
  }

  function handleNextDay() {
    if (isToday(selectedDate)) return
    setSelectedDate((prev) => addDaysToDateKey(prev, 1))
  }

  function handleProfileSave() {}

  function handleOnboardingComplete(formData) {
    setProfile(formData)
    const target = calculateDailyCalories(formData)
    setDailyCalorieTarget(toNumber(target, 2000))
    setShowOnboarding(false)
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-cream px-5 pb-10 pt-8">
      
      {/* 1. EN ÜST SATIR (TOP BAR): Logo ve Profil Avatarı */}
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="text-kalori-green">Fit</span>
          <span className="text-kalori-orange">Macro</span>
        </h1>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-mint-100 bg-white text-2xl shadow-sm">
          {profile.gender === 'kadin' ? '👩' : '👨'}
        </div>
      </div>

      {/* 2. ORTA KISIM: Selamlama ve Motivasyon */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold tracking-tight text-gray-800">
          Merhaba, {profile.name}! 👋
        </h2>
        <div className="mt-3 rounded-2xl border border-mint-100/60 bg-gradient-to-r from-mint-50/80 to-white p-4 shadow-sm">
          <p className="text-sm font-semibold italic leading-relaxed text-kalori-green">
            "{getMotivationQuote(mealTotals.calories, dailyCalorieTarget)}"
          </p>
        </div>
      </div>

      {/* 3. ALT KISIM: Tarih Çubuğu ve Geri Kalanlar */}
      <Header
        selectedDate={selectedDate}
        showDateNavigation={activeTab === 'ozet'}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        canGoNext={!isToday(selectedDate)}
      />
      
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'ozet' && (
        <>
          <CalorieCard consumedCalories={mealTotals.calories} dailyCalorieTarget={dailyCalorieTarget} />
          <MacroSection totals={mealTotals} targets={macroTargets} />
          <WaterSection currentWater={currentWater} onUpdateWater={handleUpdateWater} />
          <MealsSection meals={currentMeals} selectedDate={selectedDate} />
        </>
      )}

      {activeTab === 'premium' && (
        <PremiumDietSection profile={profile} dailyCalorieTarget={dailyCalorieTarget} macroTargets={macroTargets} />
      )}

      {activeTab === 'profil' && (
        <ProfileSection profile={profile} onProfileChange={setProfile} onProfileSave={handleProfileSave} />
      )}

      {activeTab === 'ekle' && (
        <AddFoodSection meals={currentMeals} selectedDate={selectedDate} onAddMeal={handleAddMeal} onRemoveMeal={handleRemoveMeal} />
      )}
    </div>
  )
}