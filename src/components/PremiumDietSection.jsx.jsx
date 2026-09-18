import { useState, useEffect } from 'react'
import { generatePremiumDietPlan } from '../services/aiService'

export default function PremiumDietSection({ profile, dailyCalorieTarget, macroTargets }) {
  const [dietPlan, setDietPlan] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Bugünü "YYYY-MM-DD" formatında veren yardımcı fonksiyon
  const getTodayString = () => new Date().toISOString().split('T')[0]

  // Sayfa yüklendiğinde Local Storage'a bak, bugünün menüsü varsa direkt getir
  useEffect(() => {
    const savedData = localStorage.getItem('fitmacro_premium_diet')
    if (savedData) {
      try {
        const { date, plan } = JSON.parse(savedData)
        // Eğer kaydedilen tarih bugünle aynıysa listeyi ekrana bas
        if (date === getTodayString()) {
          setDietPlan(plan)
        }
      } catch (e) {
        console.error("Kayıtlı diyet listesi okunamadı:", e)
      }
    }
  }, [])

  async function handleGeneratePlan() {
    setIsGenerating(true)
    setError(null)
    try {
      const plan = await generatePremiumDietPlan(profile, dailyCalorieTarget, macroTargets)
      setDietPlan(plan)
      
      // Başarıyla oluşturulan planı bugünün tarihiyle hafızaya kaydet
      localStorage.setItem('fitmacro_premium_diet', JSON.stringify({
        date: getTodayString(),
        plan: plan
      }))
    } catch (err) {
      setError("Diyet listesi oluşturulurken bir hata oluştu. Lütfen tekrar dene.")
    } finally {
      setIsGenerating(false)
    }
  }

  const MealCard = ({ time, icon, meal }) => (
    <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm">{icon}</span>
          <h4 className="font-bold text-gray-800">{time}</h4>
        </div>
        <span className="rounded-lg bg-mint-50 px-2 py-1 text-xs font-bold text-kalori-green">
          {meal.calories} kcal
        </span>
      </div>
      <h5 className="mb-1 text-sm font-bold text-gray-700">{meal.title}</h5>
      <p className="text-xs font-medium text-gray-500 leading-relaxed">{meal.description}</p>
    </div>
  )

  return (
    <section className="mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Eğer henüz diyet planı yoksa Karşılama Kartını göster */}
      {!dietPlan && (
        <div className="mb-6 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black text-amber-800">
                AI Diyetisyen <span className="text-xl">✨</span>
              </h2>
              <p className="mt-1 text-xs font-medium text-amber-700/80">
                Mevcut kilona, hastalıklarına ve hedeflerine özel, günlük makrolarına tam uyan kişiselleştirilmiş menünü oluştur.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-amber-600 active:scale-95 disabled:opacity-70 disabled:hover:bg-amber-500"
          >
            {isGenerating ? (
              <span className="animate-pulse">Sana Özel Menü Hazırlanıyor... ⏳</span>
            ) : (
              <>Sihirli Menüyü Oluştur 🚀</>
            )}
          </button>
        </div>
      )}

      {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-center text-xs font-bold text-red-500">{error}</div>}

      {/* Diyet Listesi Sonucu */}
      {dietPlan && !isGenerating && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-800">Bugünün Menüsü ✨</h2>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              Günlük AI Planı
            </span>
          </div>

          <div className="mb-5 rounded-2xl bg-gray-800 p-4 text-center text-white shadow-lg">
            <p className="text-sm font-medium italic">"{dietPlan.motivation}"</p>
          </div>

          <MealCard time="Kahvaltı" icon="🌅" meal={dietPlan.breakfast} />
          <MealCard time="1. Ara Öğün" icon="🍎" meal={dietPlan.snack1} />
          <MealCard time="Öğle Yemeği" icon="☀️" meal={dietPlan.lunch} />
          <MealCard time="2. Ara Öğün" icon="☕" meal={dietPlan.snack2} />
          <MealCard time="Akşam Yemeği" icon="🌙" meal={dietPlan.dinner} />
        </div>
      )}
    </section>
  )
}