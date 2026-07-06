export const AI_ANALYSIS_MS = 2500

export function formatFoodDisplayName(key) {
  return key
    .split(' ')
    .map((word) => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ')
}

export function getRandomDatabaseFood(foodDatabase) {
  const demoPool = [
    'yumurta',
    'yulaf',
    'tavuk',
    'elma',
    'mercimek',
    'ton balığı',
    'chia',
    'lor peyniri',
  ]
  const availableDemo = demoPool.filter((key) => key in foodDatabase)
  const allKeys = Object.keys(foodDatabase)
  const pool = availableDemo.length > 0 ? availableDemo : allKeys
  const key = pool[Math.floor(Math.random() * pool.length)]

  return {
    key,
    displayName: formatFoodDisplayName(key),
  }
}
