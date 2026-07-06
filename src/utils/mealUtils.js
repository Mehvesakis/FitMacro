import { caloriesFromMacros, toNumber } from './nutritionUtils'

export function normalizeMeal(meal) {
  const protein = toNumber(meal.protein)
  const carbs = toNumber(meal.carbs)
  const fat = toNumber(meal.fat)
  const fiber = toNumber(meal.fiber)

  return {
    ...meal,
    protein,
    carbs,
    fat,
    fiber,
    calories: caloriesFromMacros(protein, carbs, fat),
  }
}

export function calculateMealTotals(meals) {
  return meals.reduce(
    (totals, meal) => {
      const normalized = normalizeMeal(meal)

      return {
        calories: totals.calories + normalized.calories,
        protein: totals.protein + normalized.protein,
        carbs: totals.carbs + normalized.carbs,
        fat: totals.fat + normalized.fat,
        fiber: totals.fiber + normalized.fiber,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  )
}
