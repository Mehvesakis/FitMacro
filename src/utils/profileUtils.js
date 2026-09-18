import { toNumber } from './nutritionUtils'

export const GENDER_OPTIONS = [
  { value: 'erkek', label: 'Erkek' },
  { value: 'kadin', label: 'Kadın' },
]

export const DISEASE_OPTIONS = [
  { value: 'diyabet', label: 'Diyabet (Tip 1 / Tip 2)' },
  { value: 'insulin_direnci', label: 'İnsülin Direnci' },
  { value: 'tansiyon', label: 'Tansiyon (Hipertansiyon)' },
  { value: 'colyak', label: 'Çölyak / Glüten İntoleransı' },
  { value: 'tiroid', label: 'Tiroid Hastalıkları' },
]

export const ACTIVITY_OPTIONS = [
  { value: 'sedanter', label: 'Sedanter (Masa başı iş, sıfır egzersiz)', multiplier: 1.2, focus: 'Dengeli Beslenme' },
  { value: 'az_hareketli', label: 'Az Hareketli (Haftada 1-3 gün)', multiplier: 1.375, focus: 'Aktif Yaşam Desteği' },
  { value: 'orta_hareketli', label: 'Orta Hareketli (Haftada 3-5 gün)', multiplier: 1.55, focus: 'Fitness ve Gelişim' },
  { value: 'cok_hareketli', label: 'Çok Hareketli (Haftada 6-7 gün ağır)', multiplier: 1.725, focus: 'Yüksek Performans Odaklı' },
  { value: 'ekstra_hareketli', label: 'Ekstra Hareketli (Fiziksel iş/Sporcu)', multiplier: 1.9, focus: 'Sporcu Odaklı (Yüksek Kalori/Protein)' },
]

const MACRO_RATIOS = {
  sedanter: { protein: 0.2, carbs: 0.5, fat: 0.3 },
  az_hareketli: { protein: 0.25, carbs: 0.45, fat: 0.3 },
  orta_hareketli: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  cok_hareketli: { protein: 0.3, carbs: 0.45, fat: 0.25 },
  ekstra_hareketli: { protein: 0.35, carbs: 0.45, fat: 0.2 },
}

export function calculateBMI(weight, height) {
  if (!weight || !height) return 0
  const heightInMeters = height > 3 ? height / 100 : height
  const bmi = weight / (heightInMeters * heightInMeters)
  return Number(bmi.toFixed(1))
}

export function getBMICategory(bmi) {
  if (bmi === 0) return 'Bilinmiyor'
  if (bmi < 18.5) return 'Zayıf'
  if (bmi <= 24.9) return 'Normal'
  if (bmi <= 29.9) return 'Fazla Kilolu'
  return 'Obez'
}

// YENİ: Doğum tarihinden yaş hesaplayan yardımcı fonksiyon (Sorun buradaydı!)
export function calculateAge(birthDateString) {
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

export function calculateBMR(weight, height, age, gender) {
  const base = 10 * weight + 6.25 * height - 5 * age
  return gender === 'erkek' ? base + 5 : base - 161
}

export function calculateDailyCalories(profile) {
  // DİKKAT: Artık age yerine birthDate ve diseases kullanıyoruz!
  const { birthDate, height, weight, gender, activity, isBreastfeeding, diseases = [] } = profile
  const activityOption = ACTIVITY_OPTIONS.find((option) => option.value === activity)
  
  const age = calculateAge(birthDate)

  // Yaş hesaplanamazsa hesaplama duruyordu. Artık doğum tarihi üzerinden kusursuz çalışacak.
  if (!activityOption || !age || !height || !weight || !gender) return null

  let bmr = calculateBMR(Number(weight), Number(height), Number(age), gender)

  // HASTALIK ETKİSİ: Tiroid metabolizmayı yavaşlatabilir (%5 kesinti)
  if (diseases.includes('tiroid')) {
    bmr = bmr * 0.95
  }

  let dailyCalories = Math.round(bmr * activityOption.multiplier)

  // EMZİRME ETKİSİ: Kadınlara günlük süt üretimi için ekstra +500 kalori
  if (gender === 'kadin' && isBreastfeeding) {
    dailyCalories += 500
  }

  return dailyCalories
}

export function getNutritionFocus(activityValue, diseases = []) {
  let focus = ACTIVITY_OPTIONS.find((option) => option.value === activityValue)?.focus ?? 'Dengeli Beslenme'
  
  // Hastalıklara göre yapay zekaya gidecek "Odak" metnini şekillendiriyoruz
  if (diseases.includes('colyak')) focus += ' (Kesinlikle Glütensiz Beslenme)'
  if (diseases.includes('diyabet') || diseases.includes('insulin_direnci')) focus += ' (Düşük Glisemik İndeks / Şekersiz)'
  if (diseases.includes('tansiyon')) focus += ' (Düşük Sodyum / Tuzsuz)'
  
  return focus
}

// HASTALIKLARA GÖRE MAKRO HESABI (Diyabet/İnsülin Direnci = Düşük Karbonhidrat)
export function calculateMacroTargets(dailyCalorieTarget, activityValue, diseases = []) {
  const calories = toNumber(dailyCalorieTarget, 2248)
  let ratios = { ...(MACRO_RATIOS[activityValue] ?? MACRO_RATIOS.orta_hareketli) }

  // Eğer diyabet veya insülin direnci varsa karbonhidratı ciddi oranda düşürüp, proteini/yağı artırıyoruz
  if (diseases.includes('diyabet') || diseases.includes('insulin_direnci')) {
    ratios.carbs = Math.max(0.2, ratios.carbs - 0.15) // Karb düşür
    ratios.protein += 0.07 // Protein artır
    ratios.fat += 0.08 // Sağlıklı yağ artır
  }

  return {
    protein: Math.round((calories * ratios.protein) / 4),
    carbs: Math.round((calories * ratios.carbs) / 4),
    fat: Math.round((calories * ratios.fat) / 9),
    fiber: Math.round(calories / 75), // Lif hedefi 
  }
}