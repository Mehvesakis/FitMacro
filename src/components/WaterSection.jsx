export default function WaterSection({ currentWater, onUpdateWater }) {
  const goal = 8;
  // İlerleme yüzdesini hesaplıyoruz (Maksimum %100 olacak şekilde)
  const progress = Math.min(100, Math.max(0, (currentWater / goal) * 100));

  return (
    <div className="mb-6 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-card transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Üst Kısım: Bilgi ve İlerleme Çubuğu */}
      <div className="bg-gradient-to-br from-blue-50/80 to-white p-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-800">Su Takibi</h3>
            <p className="mt-1 text-xs font-semibold text-gray-500">
              {currentWater >= goal ? '✨ Günlük hedefe ulaştın!' : 'Günlük Hedef: 2 Litre'}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-blue-500">{currentWater}</span>
              <span className="text-xs font-bold text-gray-400">/{goal}</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-300">
              Bardak
            </span>
          </div>
        </div>

        {/* Dinamik İlerleme Çubuğu */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-blue-100/50 shadow-inner">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Alt Kısım: Etkileşimli Su Damlaları */}
      <div className="flex justify-between gap-1.5 p-5 pt-4">
        {[...Array(goal)].map((_, i) => {
          const isFilled = i < currentWater;
          return (
            <button 
              key={i}
              onClick={() => {
                // Eğer en son dolu bardağa tıklanırsa, bir azaltır (geri alır)
                if (currentWater === i + 1) onUpdateWater(i);
                // Aksi takdirde tıklanan bardağa kadar doldurur
                else onUpdateWater(i + 1);
              }}
              className={`group relative flex h-11 flex-1 items-center justify-center rounded-xl transition-all duration-300 active:scale-90 ${
                isFilled 
                  ? 'bg-gradient-to-b from-blue-400 to-blue-500 shadow-md shadow-blue-200/50 hover:from-blue-500 hover:to-blue-600' 
                  : 'bg-blue-50/50 border border-blue-100 hover:border-blue-300 hover:bg-blue-100'
              }`}
            >
              {/* Damla ikonu tıklandığında büyüyerek (scale) belirir */}
              <span className={`text-sm transition-all duration-500 ${isFilled ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                💧
              </span>
            </button>
          )
        })}
      </div>

    </div>
  )
}