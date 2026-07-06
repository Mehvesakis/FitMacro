import { useEffect, useRef, useState } from 'react'
import {
  analyzeFoodWithAI,
  createMealFromAIAnalysis,
} from '../services/aiService'

const CAMERA_SIMULATION_HINTS = [
  '2 yumurta',
  'yarım süzme peynir',
  'tavuk göğsü',
  'yulaf kasesi',
  'tam buğday ekmeği',
  'ton balığı salata',
  'mercimek çorbası',
  'elma',
]

function Spinner({ className = 'h-10 w-10' }) {
  return (
    <svg
      className={`animate-spin text-kalori-green ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"
      />
    </svg>
  )
}

function CameraViewfinder() {
  return (
    <div className="relative mx-auto flex aspect-[4/3] w-full max-w-xs items-center justify-center rounded-2xl border-2 border-dashed border-mint-200 bg-gradient-to-br from-mint-50 to-white">
      <div className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-kalori-green" />
      <div className="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-kalori-green" />
      <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-kalori-green" />
      <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-kalori-green" />

      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-card">
          <svg
            className="h-7 w-7 text-kalori-green"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              d="M4 8h2l1.5-2h9L18 8h2a2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-600">Kamera açılıyor...</p>
        <p className="text-xs text-gray-400">
          Tabakını vizörün ortasına hizala
        </p>
      </div>
    </div>
  )
}

function AnalyzingView() {
  return (
    <div className="mx-auto flex aspect-[4/3] w-full max-w-xs flex-col items-center justify-center gap-4 rounded-2xl border-2 border-mint-200 bg-gradient-to-br from-white to-mint-50 px-6 text-center">
      <Spinner />
      <div>
        <p className="text-sm font-bold text-gray-800">Yapay Zeka Analiz Ediyor...</p>
        <p className="mt-1 text-xs text-gray-400">
          Besinler ve porsiyonlar hesaplanıyor
        </p>
      </div>
    </div>
  )
}

function IdentifiedView({ foodName, nutrition }) {
  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border-2 border-mint-200 bg-gradient-to-br from-white to-mint-50 px-6 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint-100 text-3xl">
        ✅
      </div>
      <div>
        <p className="text-base font-bold text-kalori-green">
          Tanımlandı: {foodName}
        </p>
        <p className="mt-2 text-xs text-gray-500">
          {nutrition.calories} kcal · {nutrition.protein}g protein ·{' '}
          {nutrition.carbs}g karb · {nutrition.fat}g yağ
        </p>
      </div>
    </div>
  )
}

function pickCameraSimulationText() {
  return CAMERA_SIMULATION_HINTS[
    Math.floor(Math.random() * CAMERA_SIMULATION_HINTS.length)
  ]
}

export default function CameraModal({ isOpen, onClose, onAddMeal }) {
  const [step, setStep] = useState('idle')
  const [identifiedFood, setIdentifiedFood] = useState(null)
  const [pendingMeal, setPendingMeal] = useState(null)
  const fileInputRef = useRef(null)

  function resetFlow() {
    setStep('idle')
    setIdentifiedFood(null)
    setPendingMeal(null)
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

  async function runAIAnalysis(sourceText) {
    if (step === 'analyzing') return

    setStep('analyzing')
    setIdentifiedFood(null)
    setPendingMeal(null)

    try {
      const analysis = await analyzeFoodWithAI(sourceText)
      const meal = createMealFromAIAnalysis(analysis, sourceText)

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
      console.error('[KaloriAI] Kamera AI analizi başarısız:', error)
      setStep('idle')
    }
  }

  function startAnalysis() {
    runAIAnalysis(pickCameraSimulationText())
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) {
      runAIAnalysis(`kameradan yüklenen fotoğraf: ${file.name}`)
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camera-modal-title"
    >
      <button
        type="button"
        aria-label="Kamerayı kapat"
        onClick={handleClose}
        disabled={step === 'analyzing'}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 disabled:cursor-wait"
      />

      <div className="relative w-full max-w-sm scale-100 rounded-3xl border-2 border-mint-200 bg-gradient-to-br from-white to-mint-50 p-5 shadow-card transition-all duration-300">
        <button
          type="button"
          onClick={handleClose}
          disabled={step === 'analyzing'}
          aria-label="Pencereyi kapat"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-gray-500 shadow-nav transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <h2
          id="camera-modal-title"
          className="pr-10 text-base font-bold text-gray-800"
        >
          Fotoğraf Yükle / Çek
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          {step === 'analyzing'
            ? 'AI tabağını inceliyor...'
            : step === 'identified'
              ? 'Besin başarıyla tanımlandı'
              : 'Yemeğinin fotoğrafını çek veya cihazından yükle'}
        </p>

        <div className="mt-5">
          {step === 'idle' && <CameraViewfinder />}
          {step === 'analyzing' && <AnalyzingView />}
          {step === 'identified' && identifiedFood && (
            <IdentifiedView
              foodName={identifiedFood.name}
              nutrition={identifiedFood.nutrition}
            />
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

        {step === 'idle' && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={startAnalysis}
              className="rounded-2xl bg-kalori-green py-3.5 text-sm font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-mint-700 hover:shadow-lg active:translate-y-0"
            >
              Çek
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl border border-mint-200 bg-white py-3.5 text-sm font-bold text-kalori-green shadow-card transition-all hover:-translate-y-0.5 hover:bg-mint-50 hover:shadow-lg active:translate-y-0"
            >
              Bilgisayardan Yükle
            </button>
          </div>
        )}

        {step === 'identified' && (
          <button
            type="button"
            onClick={handleAddToMeals}
            className="mt-5 w-full rounded-2xl bg-kalori-green py-4 text-sm font-bold text-white shadow-card transition-all hover:-translate-y-0.5 hover:bg-mint-700 hover:shadow-lg active:translate-y-0"
          >
            Öğünlere Ekle
          </button>
        )}
      </div>
    </div>
  )
}
