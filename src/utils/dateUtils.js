export function getTodayKey(date = new Date()) {
  return formatDateKey(date)
}

export function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDisplayDate(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  })
}

export function addDaysToDateKey(dateKey, amount) {
  const date = parseDateKey(dateKey)
  date.setDate(date.getDate() + amount)
  return formatDateKey(date)
}

export function isToday(dateKey) {
  return dateKey === getTodayKey()
}

export function isFutureDate(dateKey) {
  return parseDateKey(dateKey) > parseDateKey(getTodayKey())
}

export function canGoToNextDay(dateKey) {
  return !isToday(dateKey) && !isFutureDate(dateKey)
}
