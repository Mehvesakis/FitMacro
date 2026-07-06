export function toNumber(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

export function caloriesFromMacros(protein, carbs, fat) {
  return Math.round(
    toNumber(protein) * 4 + toNumber(carbs) * 4 + toNumber(fat) * 9,
  )
}

export function normalizeNutrition(nutrition) {
  const protein = toNumber(nutrition.protein)
  const carbs = toNumber(nutrition.carbs)
  const fat = toNumber(nutrition.fat)
  const fiber = toNumber(nutrition.fiber)

  return {
    protein,
    carbs,
    fat,
    fiber,
    calories: caloriesFromMacros(protein, carbs, fat),
  }
}
