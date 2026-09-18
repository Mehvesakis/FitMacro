export default function MacroCard({ icon, current, goal, color, label }) {
  // Yüzdelik dilimi hesapla (En fazla %100 olacak şekilde sınırlandırıyoruz)
  const percentage = Math.min(100, Math.max(0, (current / (goal || 1)) * 100))

  return (
    <div className="flex-1 flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-3 shadow-card transition-all hover:shadow-md">
      
      <div className="mb-2 flex items-center gap-1.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-50 text-[11px] shadow-inner">
          {icon}
        </span>
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-gray-500">
          {label}
        </span>
      </div>
      
      <div className="mb-2 flex items-baseline gap-1">
        <span className="text-sm font-black tracking-tight text-gray-800">
          {current}
        </span>
        <span className="text-[10px] font-semibold text-gray-400">
          / {goal}g
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 shadow-inner">
        <div 
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      
    </div>
  )
}