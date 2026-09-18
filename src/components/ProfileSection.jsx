import { 
  calculateBMI, 
  getBMICategory, 
  ACTIVITY_OPTIONS, 
  DISEASE_OPTIONS 
} from '../utils/profileUtils'

function calculateAge(birthDateString) {
  if (!birthDateString) return null
  const today = new Date()
  const birthDate = new Date(birthDateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export default function ProfileSection({ profile, onProfileChange, onProfileSave }) {
  const bmi = calculateBMI(profile.weight, profile.height)
  const bmiCategory = getBMICategory(bmi)
  const userAge = calculateAge(profile.birthDate)

  const extendedDiseases = [...DISEASE_OPTIONS, { label: 'Diğer', value: 'diger' }]

  function handleChange(field, value) {
    onProfileChange({ ...profile, [field]: value })
  }

  function handleDiseaseToggle(diseaseValue) {
    const currentDiseases = profile.diseases || []
    const exists = currentDiseases.includes(diseaseValue)
    
    if (exists) {
      handleChange('diseases', currentDiseases.filter(d => d !== diseaseValue))
    } else {
      handleChange('diseases', [...currentDiseases, diseaseValue])
    }
  }

  const getBmiStyles = () => {
    if (bmiCategory === 'Zayıf') return 'text-blue-700 bg-gradient-to-br from-blue-50 to-blue-100/60 border-blue-200 shadow-lg shadow-blue-100/50'
    if (bmiCategory === 'Normal') return 'text-kalori-green bg-gradient-to-br from-mint-50 to-mint-100/60 border-mint-200 shadow-lg shadow-mint-100/50'
    if (bmiCategory === 'Fazla Kilolu') return 'text-orange-700 bg-gradient-to-br from-orange-50 to-orange-100/60 border-orange-200 shadow-lg shadow-orange-100/50'
    return 'text-red-700 bg-gradient-to-br from-red-50 to-red-100/60 border-red-200 shadow-lg shadow-red-100/50'
  }

  const getBmiIcon = () => {
    if (bmiCategory === 'Zayıf') return '🪶'
    if (bmiCategory === 'Normal') return '✨'
    if (bmiCategory === 'Fazla Kilolu') return '⚖️'
    return '❤️‍🩹'
  }

  const bmiPercent = Math.min(Math.max(((bmi - 15) / 25) * 100, 0), 100)

  return (
    <section className="mt-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* BKİ KARTI */}
      <div className={`mb-6 flex flex-col gap-5 rounded-3xl border-2 p-5 transition-all duration-300 ${getBmiStyles()}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest opacity-75">Beden Kitle İndeksi</p>
            <div className="mt-1 flex items-baseline gap-2">
              <h2 className="text-5xl font-black tracking-tight">{bmi || '0.0'}</h2>
              <span className="rounded-lg bg-white/70 px-2 py-1 text-xs font-bold uppercase shadow-sm backdrop-blur-md">
                {bmiCategory}
              </span>
            </div>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm backdrop-blur-md">
            {getBmiIcon()}
          </div>
        </div>

        <div className="relative mt-1 h-3 w-full rounded-full bg-white/50 shadow-inner">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300 via-kalori-green to-red-400 opacity-80" />
          <div 
            className="absolute top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-full bg-gray-900 shadow-md transition-all duration-700 ease-out"
            style={{ left: `calc(${bmiPercent}% - 3px)` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        
        {/* GÜNCELLENDİ: Pastel Şeftali / Sıcak Turuncu Temalı Fiziksel Bilgiler Formu */}
        <div className="rounded-3xl border border-orange-100/60 bg-gradient-to-br from-orange-50/50 to-white p-5 shadow-card transition-all hover:shadow-md">
          <h3 className="mb-5 flex items-center justify-between text-sm font-bold text-orange-900">
            Fiziksel Özellikler
            {userAge && (
              <span className="rounded-full bg-orange-100/60 px-3 py-1 text-xs font-bold text-orange-700 shadow-sm">
                {userAge} Yaşında
              </span>
            )}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-700/70">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-100/60 text-[11px]">📏</span>
                Boy (cm)
              </label>
              <input
                type="number"
                value={profile.height || ''}
                onChange={(e) => handleChange('height', e.target.value)}
                onBlur={onProfileSave}
                className="w-full rounded-xl border border-orange-100 bg-white p-3 text-sm font-bold text-gray-800 shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-orange-700/70">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-100/60 text-[11px]">⚖️</span>
                Kilo (kg)
              </label>
              <input
                type="number"
                value={profile.weight || ''}
                onChange={(e) => handleChange('weight', e.target.value)}
                onBlur={onProfileSave}
                className="w-full rounded-xl border border-orange-100 bg-white p-3 text-sm font-bold text-gray-800 shadow-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>
        </div>

        {/* Mint Yeşili Temalı Aktivite Seviyesi Formu */}
        <div className="rounded-3xl border border-mint-100/60 bg-gradient-to-br from-mint-50/50 to-white p-5 shadow-card transition-all hover:shadow-md">
          <h3 className="mb-4 text-sm font-bold text-kalori-green">Aktivite Seviyesi</h3>
          <div className="relative">
            <select
              value={profile.activity || 'orta_hareketli'}
              onChange={(e) => {
                handleChange('activity', e.target.value)
                setTimeout(onProfileSave, 100)
              }}
              className="w-full appearance-none rounded-xl border border-mint-200/50 bg-white p-4 pr-10 text-sm font-semibold text-gray-800 shadow-sm focus:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-100"
            >
              {ACTIVITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-mint-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Uçuk Mor/Lila Temalı Sağlık Durumu Formu */}
        <div className="rounded-3xl border border-purple-100/60 bg-gradient-to-br from-purple-50/50 to-white p-5 shadow-card transition-all hover:shadow-md">
          <h3 className="mb-4 text-sm font-bold text-purple-900">Sağlık Durumu</h3>
          
          <div>
            <label className="mb-3 block text-xs font-bold text-purple-700/70">Kronik Hastalıklar</label>
            <div className="flex flex-wrap gap-2">
              {extendedDiseases.map((disease) => {
                const isSelected = (profile.diseases || []).includes(disease.value)
                return (
                  <button
                    key={disease.value}
                    onClick={() => {
                      handleDiseaseToggle(disease.value)
                      setTimeout(onProfileSave, 100)
                    }}
                    className={`rounded-full border-2 px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all ${
                      isSelected 
                        ? 'border-purple-400 bg-purple-500 text-white shadow-purple-200' 
                        : 'border-purple-100 bg-white text-gray-500 hover:border-purple-200 hover:bg-purple-50'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{disease.label}
                  </button>
                )
              })}
            </div>
            
            {(profile.diseases || []).includes('diger') && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="Lütfen hastalığınızı belirtin..."
                  value={profile.otherDiseaseDetail || ''}
                  onChange={(e) => handleChange('otherDiseaseDetail', e.target.value)}
                  onBlur={onProfileSave}
                  className="w-full rounded-xl border border-purple-200 bg-purple-50/30 p-3 text-sm font-semibold text-gray-800 shadow-inner placeholder:text-gray-400 focus:border-purple-400 focus:bg-white focus:outline-none"
                />
              </div>
            )}
          </div>

          {profile.gender === 'kadin' && (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-pink-100 bg-gradient-to-r from-pink-50/50 to-pink-50/20 px-4 py-3 shadow-sm">
              <div>
                <p className="text-xs font-bold text-pink-700">Emzirme Dönemi</p>
                <p className="mt-0.5 text-[10px] font-medium text-pink-600/80">Günlük ek kalori yansıtır.</p>
              </div>
              <button
                onClick={() => {
                  handleChange('isBreastfeeding', !profile.isBreastfeeding)
                  setTimeout(onProfileSave, 100)
                }}
                className={`relative inline-flex h-6 w-10 items-center rounded-full shadow-inner transition-colors ${profile.isBreastfeeding ? 'bg-pink-500' : 'bg-pink-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${profile.isBreastfeeding ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}