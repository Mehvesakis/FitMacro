import { useState } from 'react'
import { ACTIVITY_OPTIONS, DISEASE_OPTIONS } from '../utils/profileUtils'

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birthDate: '', // age yerine birthDate kullanıyoruz
    height: '',
    weight: '',
    activity: 'orta_hareketli',
    isBreastfeeding: false,
    diseases: [],
    otherDiseaseDetail: '', // Diğer hastalığı yazmak için
  })

  // Hastalık listesine "Diğer" seçeneğini ekliyoruz
  const extendedDiseases = [...DISEASE_OPTIONS, { label: 'Diğer', value: 'diger' }]

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleDiseaseToggle(diseaseValue) {
    setFormData((prev) => {
      const exists = prev.diseases.includes(diseaseValue)
      if (exists) {
        return { ...prev, diseases: prev.diseases.filter((d) => d !== diseaseValue) }
      }
      return { ...prev, diseases: [...prev.diseases, diseaseValue] }
    })
  }

  function handleNext() {
    // Doğrulama kısmında age yerine birthDate kontrol ediliyor
    if (step === 1 && (!formData.name || !formData.gender || !formData.birthDate || !formData.height || !formData.weight)) {
      alert('Lütfen ilk adımdaki tüm bilgileri doldur.')
      return
    }
    setStep((s) => s + 1)
  }

  function handleComplete() {
    // Profil verilerini kaydet ve uygulamaya geçiş yap
    onComplete(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mint-50/50 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        
        {/* İlerleme Çubuğu */}
        <div className="bg-mint-50 px-6 py-4">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-kalori-green">
            <span>Adım {step} / 3</span>
            <span>{step === 1 ? 'Fiziksel Özellikler' : step === 2 ? 'Yaşam Tarzı' : 'Sağlık Durumu'}</span>
          </div>
          <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-mint-200">
            <div 
              className="bg-kalori-green transition-all duration-500 ease-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-6">
          {/* 1. ADIM: İSİM VE FİZİKSEL VERİLER */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
              
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Adın Ne?</label>
                <input 
                  type="text" 
                  placeholder="Örn: Mehveş"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-mint-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-mint-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Cinsiyet</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleChange('gender', 'kadin')}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      formData.gender === 'kadin' ? 'border-pink-400 bg-pink-50' : 'border-gray-100 bg-white hover:border-pink-200'
                    }`}
                  >
                    <span className="text-3xl">👩</span>
                    <span className={`text-sm font-bold ${formData.gender === 'kadin' ? 'text-pink-600' : 'text-gray-500'}`}>Kadın</span>
                  </button>
                  <button
                    onClick={() => handleChange('gender', 'erkek')}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      formData.gender === 'erkek' ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-white hover:border-blue-200'
                    }`}
                  >
                    <span className="text-3xl">👨</span>
                    <span className={`text-sm font-bold ${formData.gender === 'erkek' ? 'text-blue-600' : 'text-gray-500'}`}>Erkek</span>
                  </button>
                </div>
              </div>

              {/* YENİ: Doğum Tarihi (Geniş Satır) */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Doğum Tarihi</label>
                <input 
                  type="date" 
                  value={formData.birthDate} 
                  onChange={(e) => handleChange('birthDate', e.target.value)} 
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-mint-200 focus:bg-white focus:outline-none" 
                />
              </div>

              {/* YENİ: Boy ve Kilo (2'li Yan Yana) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Boy (cm)</label>
                  <input type="number" placeholder="170" value={formData.height} onChange={(e) => handleChange('height', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-sm focus:border-mint-200 focus:bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Kilo (kg)</label>
                  <input type="number" placeholder="61" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-sm focus:border-mint-200 focus:bg-white focus:outline-none" />
                </div>
              </div>

            </div>
          )}

          {/* 2. ADIM: AKTİVİTE SEVİYESİ */}
          {step === 2 && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
              <p className="mb-2 text-sm font-semibold text-gray-700">Günlük hareket seviyeni seç:</p>
              {ACTIVITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange('activity', option.value)}
                  className={`flex flex-col items-start rounded-xl border-2 p-3.5 transition-all ${
                    formData.activity === option.value ? 'border-kalori-green bg-mint-50' : 'border-gray-100 bg-white hover:border-mint-200'
                  }`}
                >
                  <span className={`text-sm font-bold ${formData.activity === option.value ? 'text-kalori-green' : 'text-gray-700'}`}>
                    {option.label.split('(')[0]}
                  </span>
                  <span className="mt-0.5 text-xs text-gray-500">
                    ({option.label.split('(')[1] || ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* 3. ADIM: SAĞLIK DURUMU */}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-500">
              
              {formData.gender === 'kadin' && (
                <div className="rounded-2xl border-2 border-mint-200 bg-gradient-to-br from-mint-50 to-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Emzirme Dönemi 🍼</h4>
                      <p className="mt-1 text-xs text-gray-500">Günlük ek kalori ihtiyacını hesaplar.</p>
                    </div>
                    <button
                      onClick={() => handleChange('isBreastfeeding', !formData.isBreastfeeding)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.isBreastfeeding ? 'bg-kalori-green' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.isBreastfeeding ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Kronik Hastalıklar (İsteğe Bağlı)</h4>
                <div className="flex flex-wrap gap-2">
                  {extendedDiseases.map((disease) => {
                    const isSelected = formData.diseases.includes(disease.value)
                    return (
                      <button
                        key={disease.value}
                        onClick={() => handleDiseaseToggle(disease.value)}
                        className={`rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition-all ${
                          isSelected ? 'border-kalori-green bg-kalori-green text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-mint-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{disease.label}
                      </button>
                    )
                  })}
                </div>

                {/* YENİ: "Diğer" seçildiğinde çıkan metin kutusu */}
                {formData.diseases.includes('diger') && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                    <input
                      type="text"
                      placeholder="Lütfen hastalığınızı belirtin..."
                      value={formData.otherDiseaseDetail}
                      onChange={(e) => handleChange('otherDiseaseDetail', e.target.value)}
                      className="w-full rounded-xl border border-mint-200 bg-mint-50/50 p-3 text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:border-mint-400 focus:bg-white focus:outline-none"
                    />
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Alt Butonlar */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            onClick={() => setStep((s) => s - 1)}
            className={`text-sm font-bold text-gray-500 hover:text-gray-800 ${step === 1 ? 'invisible' : ''}`}
          >
            ← Geri
          </button>
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="rounded-xl bg-kalori-green px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-mint-700 active:scale-95"
            >
              İleri →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="rounded-xl bg-kalori-green px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-mint-700 active:scale-95"
            >
              🚀 Profili Tamamla
            </button>
          )}
        </div>

      </div>
    </div>
  )
}