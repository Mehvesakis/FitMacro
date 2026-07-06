import MacroCard from './MacroCard'
import { toNumber } from '../utils/nutritionUtils'

export default function MacroSection({ totals, targets }) {
  const macros = [
    {
      icon: '💪',
      current: toNumber(totals.protein),
      goal: toNumber(targets.protein, 1),
      color: '#2D9F5A',
      label: 'Protein',
    },
    {
      icon: '⚡',
      current: toNumber(totals.carbs),
      goal: toNumber(targets.carbs, 1),
      color: '#3B82F6',
      label: 'Karb',
    },
    {
      icon: '🥑',
      current: toNumber(totals.fat),
      goal: toNumber(targets.fat, 1),
      color: '#F97316',
      label: 'Yağ',
    },
    {
      icon: '🌿',
      current: toNumber(totals.fiber),
      goal: toNumber(targets.fiber, 1),
      color: '#8B5CF6',
      label: 'Lif',
    },
  ]

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
        Makrolar
      </h2>
      <div className="flex gap-2">
        {macros.map((macro) => (
          <MacroCard key={macro.label} {...macro} />
        ))}
      </div>
    </section>
  )
}
