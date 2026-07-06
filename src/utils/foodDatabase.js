import { findMatchingKey, normalizeFoodText } from './foodUtils'
import { normalizeNutrition } from './nutritionUtils'

export const foodDatabase = {
  // Temiz besinler & kahvaltılıklar
  yulaf: { protein: 5, carbs: 27, fat: 3, fiber: 4 },
  yumurta: { protein: 6, carbs: 1, fat: 5, fiber: 0 },
  tavuk: { protein: 31, carbs: 0, fat: 4, fiber: 0 },
  elma: { protein: 1, carbs: 25, fat: 0, fiber: 4 },
  chia: { protein: 3, carbs: 6, fat: 5, fiber: 5 },
  mercimek: { protein: 9, carbs: 20, fat: 1, fiber: 8 },
  'lor peyniri': { protein: 12, carbs: 3, fat: 5, fiber: 0 },
  'süzme peynir': { protein: 9, carbs: 1, fat: 9, fiber: 0 },
  'beyaz peynir': { protein: 7, carbs: 1, fat: 7, fiber: 0 },
  peynir: { protein: 8, carbs: 1, fat: 8, fiber: 0 },
  zeytin: { protein: 1, carbs: 1, fat: 5, fiber: 0 },
  ceviz: { protein: 3, carbs: 2, fat: 9, fiber: 1 },
  'ton balığı': { protein: 20, carbs: 0, fat: 1, fiber: 0 },
  'fıstık ezmesi': { protein: 8, carbs: 6, fat: 16, fiber: 3 },
  'tam buğday ekmeği': { protein: 4, carbs: 22, fat: 2, fiber: 4 },

  // Kaçamaklar
  poğaça: { protein: 4, carbs: 28, fat: 12, fiber: 1 },
  börek: { protein: 5, carbs: 30, fat: 14, fiber: 2 },
  çikolata: { protein: 2, carbs: 15, fat: 12, fiber: 2 },
  hamburger: { protein: 15, carbs: 25, fat: 18, fiber: 2 },
  pizza: { protein: 12, carbs: 28, fat: 10, fiber: 2 },
  cips: { protein: 2, carbs: 15, fat: 10, fiber: 1 },
  kola: { protein: 0, carbs: 35, fat: 0, fiber: 0 },
  pasta: { protein: 7, carbs: 32, fat: 4, fiber: 2 },
  tatlı: { protein: 3, carbs: 30, fat: 10, fiber: 1 },
}

export const DEFAULT_FOOD = {
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  calories: 0,
}

export function lookupFood(name) {
  const normalized = normalizeFoodText(name)
  const matchedKey = findMatchingKey(normalized, Object.keys(foodDatabase))

  if (matchedKey) {
    return {
      ...normalizeNutrition(foodDatabase[matchedKey]),
      source: matchedKey,
    }
  }

  return { ...DEFAULT_FOOD, source: null }
}
