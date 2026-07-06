import {
  addDaysToDateKey,
  formatDisplayDate,
  getTodayKey,
  isToday,
} from '../utils/dateUtils'

function NavArrowButton({ direction, onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-gray-500 shadow-nav transition-colors hover:bg-mint-50 hover:text-kalori-green disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-500"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden="true"
      >
        {direction === 'prev' ? (
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  )
}

export default function Header({
  selectedDate,
  showDateNavigation = false,
  onPreviousDay,
  onNextDay,
  canGoNext = false,
}) {
  const displayDate = formatDisplayDate(selectedDate ?? getTodayKey())
  const viewingToday = isToday(selectedDate ?? getTodayKey())

  return (
    <header className="flex items-start justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-kalori-green">KALORI</span>
          <span className="text-kalori-orange">AI</span>
        </h1>

        {showDateNavigation ? (
          <div className="mt-1 flex items-center gap-2">
            <NavArrowButton
              direction="prev"
              onClick={onPreviousDay}
              label="Önceki gün"
            />
            <p className="truncate text-sm font-medium text-gray-500">
              {displayDate}
            </p>
            <NavArrowButton
              direction="next"
              onClick={onNextDay}
              disabled={!canGoNext}
              label="Sonraki gün"
            />
          </div>
        ) : (
          <p className="mt-0.5 text-sm font-medium text-gray-500">
            {displayDate}
            {!viewingToday && (
              <span className="ml-1 text-xs text-kalori-orange">· Seçili gün</span>
            )}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-kalori-orange px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
        <span aria-hidden="true">🔥</span>
        <span>7 Günlük Seri</span>
      </div>
    </header>
  )
}
