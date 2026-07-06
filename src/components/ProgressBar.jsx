import { toNumber } from '../utils/nutritionUtils'

export default function ProgressBar({ value, max, color }) {
  const safeValue = toNumber(value)
  const safeMax = Math.max(toNumber(max), 1)
  const percent = Math.min((safeValue / safeMax) * 100, 100)

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200/80">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  )
}
