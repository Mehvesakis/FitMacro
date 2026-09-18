import { useEffect, useRef, useState } from 'react'
import {
  analyzeFoodImageWithGemini,
  createMealFromAIAnalysis,
} from '../services/aiService'

// HIZLANDIRICI: Sıkıştırma fonksiyonunu ana bileşenin dışına ekledik
function compressImage(base64Str, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = base64Str
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      let width = img.width
      let height = img.height
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
  })
}

function Spinner({ className = 'h-10 w-10' }) {
  return (
    <svg
      className={`animate-spin text-kalori-green ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z" />
    </svg>
  )
}

function CameraViewfinder() {
  return (
    <div className="relative mx-auto flex aspect-[4/3] w-full max-w-xs items-center justify-center overflow-hidden rounded-3xl border-2 border-mint-200 bg-gradient-to-br from-mint-50/50 to-white shadow-inner animate-in zoom-in-95 duration-500">
      {/* Köşe İşaretçileri (Akıllı Vizör Hissi) */}
      <div className="absolute left-5 top-5 h-8 w-8 border-l-4 border-t-4 border-kalori-green/50 rounded-tl-xl" />
      <div className="absolute right-5 top-5 h-8 w-8 border-r-4 border-t-4 border-kalori-green/50 rounded-tr-xl" />
      <div className="absolute bottom-5 left-5 h-8 w-8 border-b-4 border-l-4 border-kalori-green/50 rounded-bl-xl" />
      <div className="absolute bottom-5 right-5 h-8 w-8 border-b-4 border-r-4 border-kalori-green/50 rounded-br-xl" />

      {/* Merkez İkon ve Metin */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-card shadow-kalori-green/10">
          <div className="absolute inset-0 rounded-2xl bg-kalori-green/20 animate-ping opacity-20"></div>
          <span className="text-3xl">🤖</span>
        </div>
        <div>
          <p className="text-sm font-black tracking-tight text-gray-800">Yapay Zeka Vizörü</p>
          <p className="mt-1 text-xs font-semibold text-gray-400">Tabağını tam ortala ve çek</p>
        </div>
      </div>
    </div>
  )
}

function AnalyzingView({ imagePreview }) {
  return (
    <div className="relative mx-auto flex aspect-[4/3] w-full max-w-xs overflow-hidden rounded-3xl border-2 border-mint-200 bg-black shadow-inner animate-in fade-in duration-500">
      {/* Çekilen Fotoğraf Arka Planda Bulanık */}
      {imagePreview && (
        <img src={imagePreview} alt="Analiz" className="absolute inset-0 h-full w-full object-cover opacity-50 blur-[2px]" />
      )}
      
      {/* Holografik Tarama Efekti */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-kalori-green/50 to-transparent animate-pulse" />
      
      {/* Merkez İçerik */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
        <Spinner className="h-12 w-12 text-white drop-shadow-[0_0_15px_rgba(45,159,90,0.8)]" />
        <div className="mt-5 text-center">
          <p className="text-sm font-black tracking-widest text-white drop-shadow-md">SİHİR GERÇEKLEŞİYOR...</p>
          <p className="mt-1 text-[11px] font-bold text-mint-100">Besin değerleri hesaplanıyor</p>
        </div>
      </div>
    </div>
  )
}

function IdentifiedView({ foodName, nutrition }) {
  return (
    <div className="mx-auto w-full max-w-xs overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-card animate-in zoom-in-95 duration-500">
      <div className="relative overflow-hidden bg-gradient-to-br from-mint-400 to-kalori-green p-6 text-center text-white">
        <div className="absolute -right-4 -top-4 text-7xl opacity-20 transform rotate-12">✨</div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-mint-100 drop-shadow-sm">Analiz Başarılı</p>
        <h3 className="mt-1.5 text-lg font-black leading-tight drop-shadow-md">{foodName}</h3>
      </div>
      
      <div className="p-5">
        <div className="mb-5 flex items-baseline justify-center gap-1">
          <span className="text-4xl font-black tracking-tighter text-gray-800">{nutrition.calories}</span>
          <span className="text-sm font-bold text-gray-400">kcal</span>
        </div>
        
        <div className="flex justify-between gap-2.5">
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-mint-50 py-3 shadow-sm">
            <span className="text-[10px] font-extrabold tracking-wider text-kalori-green">PROTEİN</span>
            <span className="mt-1 text-sm font-black text-gray-800">{nutrition.protein}g</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-orange-50 py-3 shadow-sm">
            <span className="text-[10px] font-extrabold tracking-wider text-orange-500">KARB</span>
            <span className="mt-1 text-sm font-black text-gray-800">{nutrition.carbs}g</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-blue-50 py-3 shadow-sm">
            <span className="text-[10px] font-extrabold tracking-wider text-blue-500">YAĞ</span>
            <span className="mt-1 text-sm font-black text-gray-800">{nutrition.fat}g</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CameraModal({ isOpen, onClose, onAddMeal }) {
  const [step, setStep] = useState('idle')
  const [identifiedFood, setIdentifiedFood] = useState(null)
  const [pendingMeal, setPendingMeal] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileInputRef = useRef(null)

  function resetFlow() {
    setStep('idle')
    setIdentifiedFood(null)
    setPendingMeal(null)
    setImagePreview(null)
  }

  useEffect(() => {
    if (!isOpen) {
      resetFlow()
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && step !== 'analyzing') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, step])

  if (!isOpen) return null

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = '' 
    if (!file) return

    setStep('analyzing')
    
    try {
      const base64Image = await fileToBase64(file)
      setImagePreview(base64Image)

      const compressedBase64 = await compressImage(base64Image)
      const analysis = await analyzeFoodImageWithGemini(compressedBase64)
      const meal = createMealFromAIAnalysis(analysis)

      setIdentifiedFood({
        name: analysis.name,
        nutrition: {
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
        },
      })
      setPendingMeal(meal)
      setStep('identified')
    } catch (error) {
      console.error('[FitMacro] AI Görsel Analizi başarısız:', error)
      alert("Fotoğraf analiz edilemedi. Lütfen daha aydınlık ve net bir fotoğraf ile tekrar dene.")
      resetFlow()
    }
  }

  function handleAddToMeals() {
    if (!pendingMeal) return
    onAddMeal(pendingMeal)
    onClose()
  }

  function handleClose() {
    if (step === 'analyzing') return
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      {/* Arka Plan Karartması */}
      <button
        type="button"
        aria-label="Kamerayı kapat"
        onClick={handleClose}
        disabled={step === 'analyzing'}
        className="absolute inset-0 w-full h-full bg-gray-900/60 backdrop-blur-sm transition-all duration-300 disabled:cursor-wait"
      />

      <div className="relative z-10 w-full max-w-sm rounded-[2rem] border border-white/50 bg-gradient-to-br from-white to-mint-50 p-6 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-8">
        
        {/* Kapat Butonu */}
        <button
          type="button"
          onClick={handleClose}
          disabled={step === 'analyzing'}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm transition-all hover:bg-red-50 hover:text-red-500 hover:shadow active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" /></svg>
        </button>

        {/* Dinamik Başlık */}
        <div className="pr-12">
          <h2 className="text-lg font-black tracking-tight text-gray-800">
            {step === 'idle' && 'Tabağını Okut'}
            {step === 'analyzing' && 'Analiz Ediliyor'}
            {step === 'identified' && 'İşte Makroların'}
          </h2>
        </div>

        {/* Ana İçerik Alanı */}
        <div className="mt-6">
          {step === 'idle' && <CameraViewfinder />}
          {step === 'analyzing' && <AnalyzingView imagePreview={imagePreview} />}
          {step === 'identified' && identifiedFood && (
            <IdentifiedView foodName={identifiedFood.name} nutrition={identifiedFood.nutrition} />
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Aksiyon Butonları */}
        <div className="mt-6">
          {step === 'idle' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-kalori-green py-4 text-sm font-bold text-white shadow-lg shadow-kalori-green/30 transition-all hover:-translate-y-0.5 hover:bg-mint-700 hover:shadow-xl active:translate-y-0"
            >
              <span className="text-xl">📸</span>
              Kamerayı Aç / Seç
            </button>
          )}

          {step === 'identified' && (
            <button
              type="button"
              onClick={handleAddToMeals}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-kalori-green py-4 text-sm font-bold text-white shadow-lg shadow-kalori-green/30 transition-all hover:-translate-y-0.5 hover:bg-mint-700 hover:shadow-xl active:translate-y-0"
            >
              Günlüğe Kaydet ✍️
            </button>
          )}
        </div>
        
      </div>
    </div>
  )
}