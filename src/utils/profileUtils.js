export const GENDER_OPTIONS = [
  { value: 'erkek', label: 'Erkek' },
  { value: 'kadin', label: 'Kadın' },
]

export const ACTIVITY_OPTIONS = [
  {
    value: 'sedanter',
    label: 'Sedanter',
    multiplier: 1.2,
    focus: 'Dengeli Beslenme',
  },
  {
    value: 'hafif',
    label: 'Hafif Hareketli',
    multiplier: 1.375,
    focus: 'Aktif Yaşam Desteği',
  },
  {
    value: 'spor',
    label: 'Spor/Fitness Odaklı (Yüksek Protein)',
    multiplier: 1.55,
    focus: 'Yüksek Proteinli Beslenme',
  },
]

export function calculateBMR(weight, height, age, gender) {
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'erkek' ? base + 5 : base - 161
}

export function calculateDailyCalories(profile) {
  const { age, height, weight, gender, activity } = profile
  const activityOption = ACTIVITY_OPTIONS.find((option) => option.value === activity)

  if (!activityOption || !age || !height || !weight || !gender) return null

  const bmr = calculateBMR(Number(weight), Number(height), Number(age), gender)
  return Math.round(bmr * activityOption.multiplier)
}

export function getNutritionFocus(activityValue) {
  return (
    ACTIVITY_OPTIONS.find((option) => option.value === activityValue)?.focus ??
    'Dengeli Beslenme'
  )
}

const MACRO_RATIOS = {
  sedanter: { protein: 0.2, carbs: 0.5, fat: 0.3 },
  hafif: { protein: 0.25, carbs: 0.45, fat: 0.3 },
  spor: { protein: 0.3, carbs: 0.4, fat: 0.3 },
}

import { toNumber } from './nutritionUtils'

export function calculateMacroTargets(dailyCalorieTarget, activityValue) {
  const calories = toNumber(dailyCalorieTarget, 2248)
  const ratios = MACRO_RATIOS[activityValue] ?? MACRO_RATIOS.spor

  return {
    protein: Math.round((calories * ratios.protein) / 4),
    carbs: Math.round((calories * ratios.carbs) / 4),
    fat: Math.round((calories * ratios.fat) / 9),
    fiber: Math.round(calories / 75),
  }
}
