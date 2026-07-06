const UNHEALTHY_KEYWORDS = [
  'cips',
  'kola',
  'şeker',
  'çikolata',
  'kızartma',
  'tatlı',
  'börek',
  'pasta',
  'poğaça',
  'pogaca',
  'hamburger',
  'pizza',
  'gazoz',
  'donut',
  'kurabiye',
  'patates kızartması',
]

const HEALTHY_KEYWORDS = [
  'yulaf',
  'yumurta',
  'tam buğday',
  'chia',
  'tavuk',
  'mercimek',
  'lor peyniri',
  'lor',
  'süzme peynir',
  'beyaz peynir',
  'peynir',
  'zeytin',
  'ceviz',
  'ton balığı',
  'fıstık ezmesi',
  'elma',
  'brokoli',
  'somon',
]

export function normalizeFoodText(text) {
  return text.toLocaleLowerCase('tr-TR').trim()
}

export function isUnhealthyFood(name) {
  const normalized = normalizeFoodText(name)
  return UNHEALTHY_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

export function isHealthyFood(name) {
  const normalized = normalizeFoodText(name)
  return HEALTHY_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

export function getFoodCategory(name) {
  if (isUnhealthyFood(name)) return 'unhealthy'
  if (isHealthyFood(name)) return 'healthy'
  return 'neutral'
}

export function findMatchingKey(normalizedText, keys) {
  return [...keys]
    .sort((a, b) => b.length - a.length)
    .find((key) => normalizedText.includes(key))
}
