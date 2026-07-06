import { formatFoodDisplayName } from './aiFoodSimulation'
import { foodDatabase } from './foodDatabase'
import { findMatchingKey, normalizeFoodText } from './foodUtils'
import { caloriesFromMacros, normalizeNutrition, toNumber } from './nutritionUtils'

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i])

  for (let j = 0; j <= a.length; j += 1) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i += 1) {
    for (let j = 1; j <= a.length; j += 1) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

function tokenize(text) {
  return normalizeFoodText(text)
    .split(/[\s,.;]+/)
    .filter((token) => token.length > 0)
}

function wordMatches(token, keyword) {
  if (token === keyword) return true
  if (token.includes(keyword) || keyword.includes(token)) return true

  const minLength = Math.min(token.length, keyword.length)
  if (minLength >= 4) {
    return levenshtein(token, keyword) <= 1
  }

  return false
}

export function fuzzyMatchFoodKey(input, keys = Object.keys(foodDatabase)) {
  const normalized = normalizeFoodText(input)
  const tokens = tokenize(input)
  const sortedKeys = [...keys].sort((a, b) => b.length - a.length)

  const directMatch = findMatchingKey(normalized, sortedKeys)
  if (directMatch) return directMatch

  for (const key of sortedKeys) {
    const parts = key.split(/\s+/)

    if (
      parts.every(
        (part) =>
          normalized.includes(part) ||
          tokens.some((token) => wordMatches(token, part)),
      )
    ) {
      return key
    }
  }

  for (const key of sortedKeys) {
    if (key.includes(' ')) continue

    if (
      tokens.some((token) => wordMatches(token, key)) ||
      normalized.includes(key)
    ) {
      return key
    }
  }

  return null
}

export function parsePortionMultiplier(input) {
  const normalized = normalizeFoodText(input)

  if (/\byarım\b/.test(normalized)) {
    return { multiplier: 0.5, label: 'Yarım Porsiyon' }
  }

  if (/\bçeyrek\b/.test(normalized)) {
    return { multiplier: 0.25, label: 'Çeyrek Porsiyon' }
  }

  const numberMatch = normalized.match(/\b(\d+(?:[.,]\d+)?)\b/)
  if (numberMatch) {
    const multiplier = toNumber(numberMatch[1].replace(',', '.'), 1)
    if (multiplier > 0 && multiplier !== 1) {
      return {
        multiplier,
        label: `${numberMatch[1].replace(',', '.')} Porsiyon`,
      }
    }
  }

  return { multiplier: 1, label: '' }
}

export function scaleNutritionValues(nutrition, multiplier) {
  const protein = Math.round(toNumber(nutrition.protein) * multiplier)
  const carbs = Math.round(toNumber(nutrition.carbs) * multiplier)
  const fat = Math.round(toNumber(nutrition.fat) * multiplier)
  const fiber = Math.round(toNumber(nutrition.fiber) * multiplier)

  return {
    protein,
    carbs,
    fat,
    fiber,
    calories: caloriesFromMacros(protein, carbs, fat),
  }
}

export function buildMealDisplayName(portionLabel, foodKey, calories) {
  const foodName = formatFoodDisplayName(foodKey)
  const title = portionLabel ? `${portionLabel} ${foodName}` : foodName
  return `${title} - ${Math.round(calories)} kcal`
}

export function parseMealFromInput(rawInput) {
  const input = rawInput.trim()
  const matchedKey = fuzzyMatchFoodKey(input)
  const { multiplier, label: portionLabel } = parsePortionMultiplier(input)

  if (!matchedKey) {
    return {
      id: crypto.randomUUID(),
      name: input,
      searchInput: input,
      matchedKey: null,
      addedAt: new Date(),
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      calories: 0,
    }
  }

  const baseNutrition = normalizeNutrition(foodDatabase[matchedKey])
  const scaled = scaleNutritionValues(baseNutrition, multiplier)

  return {
    id: crypto.randomUUID(),
    name: buildMealDisplayName(portionLabel, matchedKey, scaled.calories),
    searchInput: input,
    matchedKey,
    addedAt: new Date(),
    ...scaled,
  }
}
