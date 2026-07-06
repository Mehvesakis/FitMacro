import { getTodayKey } from './dateUtils'
import { normalizeMeal } from './mealUtils'

const STORAGE_KEYS = {
  MEALS: 'kaloriai_meals',
  PROFILE: 'kaloriai_profile',
}

export const DEFAULT_PROFILE = {
  age: '24',
  height: '170',
  weight: '62',
  gender: 'kadin',
  activity: 'spor',
  dailyCalorieTarget: null,
}

function normalizeMealsArray(meals) {
  if (!Array.isArray(meals)) return []

  return meals.map((meal) =>
    normalizeMeal({
      ...meal,
      addedAt: new Date(meal.addedAt),
    }),
  )
}

function serializeMealsArray(meals) {
  return meals.map((meal) => ({
    ...meal,
    addedAt: meal.addedAt.toISOString(),
  }))
}

export function loadMealsByDate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEALS)
    if (!raw) return {}

    const parsed = JSON.parse(raw)

    if (Array.isArray(parsed)) {
      return {
        [getTodayKey()]: normalizeMealsArray(parsed),
      }
    }

    if (parsed && typeof parsed === 'object') {
      return Object.fromEntries(
        Object.entries(parsed).map(([dateKey, meals]) => [
          dateKey,
          normalizeMealsArray(meals),
        ]),
      )
    }

    return {}
  } catch {
    return {}
  }
}

export function saveMealsByDate(mealsByDate) {
  const serialized = Object.fromEntries(
    Object.entries(mealsByDate).map(([dateKey, meals]) => [
      dateKey,
      serializeMealsArray(meals),
    ]),
  )

  localStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(serialized))
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE)
    if (!raw) return DEFAULT_PROFILE

    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfile(profile) {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
}
