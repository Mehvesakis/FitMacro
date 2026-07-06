import { formatFoodDisplayName } from '../utils/aiFoodSimulation'
import {
  fuzzyMatchFoodKey,
  parsePortionMultiplier,
  scaleNutritionValues,
} from '../utils/foodMatching'
import { foodDatabase } from '../utils/foodDatabase'
import { normalizeFoodText } from '../utils/foodUtils'
import {
  caloriesFromMacros,
  normalizeNutrition,
  toNumber,
} from '../utils/nutritionUtils'

const AI_SIMULATION_DELAY_MS = 2000

const ANALYSIS_PROMPT = (userText) =>
  `Kullanıcının girdiği şu besin metnini analiz et ve porsiyon boyutunu da göz önüne alarak SADECE şu JSON formatında cevap ver: { "name": "Besin Adı", "calories": 100, "protein": 10, "carbs": 20, "fat": 5 }. Başka hiçbir metin ekleme. Besin metni: "${userText}"`

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function capitalizeWords(text) {
  return text
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ')
}

function extractFoodLabel(userText) {
  let cleaned = normalizeFoodText(userText)
  cleaned = cleaned
    .replace(/\byarım\b/g, '')
    .replace(/\bçeyrek\b/g, '')
    .replace(/\bdilim\b/g, '')
    .replace(/\bporsiyon\b/g, '')
    .replace(/\b(\d+(?:[.,]\d+)?)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned || userText.trim()
}

function buildDisplayName(portionLabel, foodLabel) {
  if (portionLabel) {
    return `${portionLabel} ${capitalizeWords(foodLabel)}`
  }

  return capitalizeWords(foodLabel)
}

function normalizeAnalysisResult(raw) {
  const protein = Math.round(toNumber(raw.protein))
  const carbs = Math.round(toNumber(raw.carbs))
  const fat = Math.round(toNumber(raw.fat))
  const calories =
    toNumber(raw.calories) || caloriesFromMacros(protein, carbs, fat)

  return {
    name: String(raw.name ?? 'Bilinmeyen Besin').trim(),
    calories: Math.round(calories),
    protein,
    carbs,
    fat,
  }
}

function parseJsonFromAIContent(content) {
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AI yanıtında JSON bulunamadı')
  }

  return normalizeAnalysisResult(JSON.parse(jsonMatch[0]))
}

async function callOpenAI(userText) {
  const apiKey = import.meta.env.VITE_AI_API_KEY
  const apiUrl =
    import.meta.env.VITE_AI_API_URL ||
    'https://api.openai.com/v1/chat/completions'
  const model = import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini'

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'Sen bir beslenme uzmanısın. Yalnızca istenen JSON formatında yanıt ver.',
        },
        {
          role: 'user',
          content: ANALYSIS_PROMPT(userText),
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`AI API hatası: ${response.status}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('AI yanıtı boş geldi')
  }

  return parseJsonFromAIContent(content)
}

async function generateMockAnalysis(userText) {
  await delay(AI_SIMULATION_DELAY_MS)

  const { multiplier, label: portionLabel } = parsePortionMultiplier(userText)
  const matchedKey = fuzzyMatchFoodKey(userText, Object.keys(foodDatabase))
  const foodLabel = matchedKey
    ? formatFoodDisplayName(matchedKey)
    : capitalizeWords(extractFoodLabel(userText))

  if (matchedKey) {
    const baseNutrition = normalizeNutrition(foodDatabase[matchedKey])
    const scaled = scaleNutritionValues(baseNutrition, multiplier)

    return {
      name: buildDisplayName(
        portionLabel,
        matchedKey ? formatFoodDisplayName(matchedKey) : foodLabel,
      ),
      calories: scaled.calories,
      protein: scaled.protein,
      carbs: scaled.carbs,
      fat: scaled.fat,
    }
  }

  const estimatedCalories = Math.max(Math.round(80 * multiplier), 0)
  const estimatedProtein = Math.max(Math.round(4 * multiplier), 0)
  const estimatedCarbs = Math.max(Math.round(10 * multiplier), 0)
  const estimatedFat = Math.max(Math.round(3 * multiplier), 0)

  return {
    name: buildDisplayName(portionLabel, foodLabel),
    calories: caloriesFromMacros(
      estimatedProtein,
      estimatedCarbs,
      estimatedFat,
    ) || estimatedCalories,
    protein: estimatedProtein,
    carbs: estimatedCarbs,
    fat: estimatedFat,
  }
}

export async function analyzeFoodWithAI(userText) {
  const trimmed = userText?.trim()

  if (!trimmed) {
    throw new Error('Analiz edilecek besin metni boş olamaz')
  }

  const apiKey = import.meta.env.VITE_AI_API_KEY

  try {
    if (!apiKey) {
      return await generateMockAnalysis(trimmed)
    }

    return await callOpenAI(trimmed)
  } catch (error) {
    console.warn('[KaloriAI] AI analizi başarısız, simülasyon moduna geçiliyor:', error)
    return generateMockAnalysis(trimmed)
  }
}

export function createMealFromAIAnalysis(analysis, searchInput) {
  const normalized = normalizeAnalysisResult(analysis)

  return {
    id: crypto.randomUUID(),
    name: `${normalized.name} - ${normalized.calories} kcal`,
    searchInput: searchInput.trim(),
    matchedKey: null,
    addedAt: new Date(),
    calories: normalized.calories,
    protein: normalized.protein,
    carbs: normalized.carbs,
    fat: normalized.fat,
    fiber: 0,
    source: import.meta.env.VITE_AI_API_KEY ? 'ai' : 'ai-simulation',
  }
}

export { AI_SIMULATION_DELAY_MS }
