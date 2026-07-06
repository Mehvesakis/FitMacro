import ProgressBar from './ProgressBar'

export default function MacroCard({ icon, current, goal, color, label }) {
  return (
    <div className="flex flex-1 flex-col items-center rounded-2xl bg-white px-2 py-4 shadow-card">
      <span className="text-xl" aria-hidden="true">
        {icon}
      </span>
      <p className="mt-2 text-center text-xs font-bold leading-tight" style={{ color }}>
        {current}g / {goal}g
      </p>
      <div className="mt-2 w-full px-1">
        <ProgressBar value={current} max={goal} color={color} />
      </div>
      <p className="mt-2 text-xs font-semibold text-gray-500">{label}</p>
    </div>
  )
}
