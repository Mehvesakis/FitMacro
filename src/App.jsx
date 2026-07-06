import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import NavTabs from './components/NavTabs'
import CalorieCard from './components/CalorieCard'
import MacroSection from './components/MacroSection'
import MealsSection from './components/MealsSection'
import AddFoodSection from './components/AddFoodSection'
import ProfileSection from './components/ProfileSection'
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
  const target = profile.dailyCalorieTarget ?? calculateDailyCalories(profile)
  return toNumber(target, 2248)
}

export default function App() {
  const [activeTab, setActiveTab] = useState('ozet')
  const [mealsByDate, setMealsByDate] = useState(() => loadMealsByDate())
  const [selectedDate, setSelectedDate] = useState(() => getTodayKey())
  const [profile, setProfile] = useState(() => loadProfile())
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(() =>
    getInitialDailyCalorieTarget(loadProfile()),
  )

  const currentMeals = useMemo(
    () => mealsByDate[selectedDate] ?? [],
    [mealsByDate, selectedDate],
  )

  const mealTotals = useMemo(
    () => calculateMealTotals(currentMeals),
    [currentMeals],
  )

  const macroTargets = useMemo(
    () => calculateMacroTargets(dailyCalorieTarget, profile.activity),
    [dailyCalorieTarget, profile.activity],
  )

  useEffect(() => {
    saveMealsByDate(mealsByDate)
  }, [mealsByDate])

  useEffect(() => {
    saveProfile({ ...profile, dailyCalorieTarget })
  }, [profile, dailyCalorieTarget])

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

  function handlePreviousDay() {
    setSelectedDate((prev) => addDaysToDateKey(prev, -1))
  }

  function handleNextDay() {
    if (isToday(selectedDate)) return
    setSelectedDate((prev) => addDaysToDateKey(prev, 1))
  }

  function handleProfileSave() {
    const target = toNumber(calculateDailyCalories(profile), dailyCalorieTarget)
    setDailyCalorieTarget(target)
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-cream px-5 pb-10 pt-8">
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
          <CalorieCard
            consumedCalories={mealTotals.calories}
            dailyCalorieTarget={dailyCalorieTarget}
          />
          <MacroSection totals={mealTotals} targets={macroTargets} />
          <MealsSection meals={currentMeals} selectedDate={selectedDate} />
        </>
      )}

      {activeTab === 'profil' && (
        <ProfileSection
          profile={profile}
          onProfileChange={setProfile}
          onProfileSave={handleProfileSave}
        />
      )}

      {activeTab === 'ekle' && (
        <AddFoodSection
          meals={currentMeals}
          selectedDate={selectedDate}
          onAddMeal={handleAddMeal}
          onRemoveMeal={handleRemoveMeal}
        />
      )}
    </div>
  )
}
