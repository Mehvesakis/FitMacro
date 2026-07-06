import { findMatchingKey, normalizeFoodText } from './foodUtils'

const FALLBACK_RECIPE = {
  type: 'fallback',
  badge: '💡 Pratik Fikir',
  title: 'Tavada Yumurtalı Yulaf Tostu',
  description:
    'Yulaf, yumurta ve az sütü çırp; tavada her iki yüzünü pişir. Arasına lor peyniri koy. Tek tavada hazır, yüksek proteinli joker tarif.',
  time: '10 dk',
}

const INDULGENT_RECIPE_MAP = {
  poğaça: {
    type: 'warning',
    badge: '🚨 Alternatif Öneri',
    title: 'Yulaftan Tava Poğaçası',
    description:
      'Yüksek rafine karb! Alternatif: Yulaf unu, yumurta ve lor peyniri karışımını tavada arkalı önlü pişir. İçine lor peyniri ekle — tek tavada hazır.',
    time: '12 dk',
  },
  pogaca: {
    type: 'warning',
    badge: '🚨 Alternatif Öneri',
    title: 'Yulaftan Tava Poğaçası',
    description:
      'Yüksek rafine karb! Alternatif: Yulaf unu, yumurta ve lor peyniri karışımını tavada arkalı önlü pişir. İçine lor peyniri ekle — tek tavada hazır.',
    time: '12 dk',
  },
  börek: {
    type: 'warning',
    badge: '🚨 Alternatif Öneri',
    title: 'Tavada Lorlu Yulaf Gözlemesi',
    description:
      'Yüksek yağ ve rafine karb! Alternatif: Yulaf-yumurta hamurunu tavada ince aç, lor peyniri serp, katla ve iki yüzünü pişir.',
    time: '12 dk',
  },
  çikolata: {
    type: 'warning',
    badge: '🚨 Alternatif Öneri',
    title: 'Tavada Muzlu Yulaf Topları',
    description:
      'Yüksek rafine şeker! Alternatif: Ezilmiş muz, yulaf ve yumurtayı karıştır; tavada küçük porsiyonlar halinde pişir. Doğal tatlı, yüksek protein.',
    time: '10 dk',
  },
  hamburger: {
    type: 'warning',
    badge: '🚨 Alternatif Öneri',
    title: 'Tavada Tavuk Burger Köftesi',
    description:
      'Yüksek doymuş yağ! Alternatif: Kıyma tavuk göğsünden tek tavada köfte pişir, tam buğday ekmeği yerine yulaflı krep kullan.',
    time: '15 dk',
  },
  pizza: {
    type: 'warning',
    badge: '🚨 Alternatif Öneri',
    title: 'Tavada Yulaflı Fit Pizza',
    description:
      'Yüksek rafine karb! Alternatif: Yulaf-yumurta tabanını tavada pişir, üzerine lor peyniri ve sebze ekle, kapağı kapatarak erit.',
    time: '14 dk',
  },
  cips: {
    type: 'warning',
    badge: '🚨 Alternatif Öneri',
    title: 'Tavada Baharatlı Nohut Kavurması',
    description:
      'Yüksek rafine yağ! Alternatif: Süzülmüş nohutu tek tavada kimyon, kırmızı biber ve sarımsakla kavur. Çıtır, yüksek proteinli atıştırmalık.',
    time: '10 dk',
  },
  kola: {
    type: 'warning',
    badge: '🚨 Alternatif Öneri',
    title: 'Buzlu Chia-Limon Detoks İçeceği',
    description:
      'Yüksek rafine şeker! Alternatif: Su, limon, chia ve nane karışımını 5 dakika beklet. Şekersiz, tok tutan pratik içecek.',
    time: '5 dk',
  },
  pasta: {
    type: 'warning',
    badge: '🚨 Alternatif Öneri',
    title: 'Tavada Mercimekli Sebze Sote',
    description:
      'Yüksek rafine karb! Alternatif: Haşlanmış mercimeği sebzelerle tek tavada sotele. Makarna yerine yüksek proteinli tabak.',
    time: '12 dk',
  },
  tatlı: {
    type: 'warning',
    badge: '🚨 Alternatif Öneri',
    title: 'Tavada Protein Pankek',
    description:
      'Yüksek rafine şeker! Alternatif: Yulaf, yumurta ve tarçını tavada pişir; üzerine yoğurt ve tarçın ekle. Tek tavada hazır.',
    time: '10 dk',
  },
  kızartma: {
    type: 'warning',
    badge: '🚨 Alternatif Öneri',
    title: 'Tavada Baharatlı Tavuk Dilimleri',
    description:
      'Yüksek trans yağ riski! Alternatif: Tavuk göğsünü ince dilimle, tek tavada zeytinyağı ve baharatlarla 10 dakikada pişir.',
    time: '12 dk',
  },
}

const CLEAN_RECIPE_MAP = {
  'ton balığı': {
    type: 'tip',
    badge: '💡 Pratik Fikir',
    title: 'Ton Balıklı Yulaf Lavaş Dürüm',
    description:
      'Tavada ısıtılmış tam buğday lavaşa ton balığı, lor peyniri ve yeşillik sar. Tek tavada hazır, yüksek proteinli dürüm.',
    time: '10 dk',
  },
  mercimek: {
    type: 'tip',
    badge: '💡 Pratik Fikir',
    title: 'Tavada Mercimek Köftesi',
    description:
      'Haşlanmış mercimek ve yulaf ununu yoğur, tavada köfte şeklinde pişir. Ek ekipman gerekmez, yüksek protein ve lif.',
    time: '15 dk',
  },
  'lor peyniri': {
    type: 'tip',
    badge: '💡 Pratik Fikir',
    title: 'Tavada Lorlu Omlet Wrap',
    description:
      'Yumurta ve lor peynirini çırp, tavada omlet yap; tam buğday ekmeğiyle sar. 8 dakikada yüksek proteinli öğün.',
    time: '8 dk',
  },
  lor: {
    type: 'tip',
    badge: '💡 Pratik Fikir',
    title: 'Tavada Lorlu Omlet Wrap',
    description:
      'Yumurta ve lor peynirini çırp, tavada omlet yap; tam buğday ekmeğiyle sar. 8 dakikada yüksek proteinli öğün.',
    time: '8 dk',
  },
  'fıstık ezmesi': {
    type: 'tip',
    badge: '💡 Pratik Fikir',
    title: 'Tavada Fıstık Ezmeli Yulaf Krep',
    description:
      'Yulaf-yumurta krepini tavada pişir, ince fıstık ezmesi sür. Sağlıklı yağ ve protein dengesi, tek tavada hazır.',
    time: '10 dk',
  },
  'tam buğday ekmeği': {
    type: 'tip',
    badge: '💡 Pratik Fikir',
    title: 'Tavada Yulaflı Krep Tost',
    description:
      'Yulaf unu ve yumurtayla krep pişir, arasına lor peyniri koy. Tam buğday ekmeğine yüksek proteinli alternatif.',
    time: '12 dk',
  },
  yulaf: {
    type: 'tip',
    badge: '💡 Pratik Fikir',
    title: 'Tavada Protein Yulaf Pankek',
    description:
      'Yulaf, yumurta ve tarçını karıştır; tavada her iki yüzünü pişir. Üzerine yoğurt gezdir — güçlü kahvaltı.',
    time: '8 dk',
  },
  yumurta: {
    type: 'tip',
    badge: '💡 Pratik Fikir',
    title: 'Tavada Sebzeli Omlet Wrap',
    description:
      'Yumurtayı sebzelerle tavada omlet yap, tam buğday lavaşa sar. Hızlı, pratik ve yüksek proteinli.',
    time: '10 dk',
  },
  tavuk: {
    type: 'tip',
    badge: '💡 Pratik Fikir',
    title: 'Tek Tavada Sebzeli Tavuk Sote',
    description:
      'Tavuk parçalarını biber ve brokoli ile tek tavada 12 dakikada sotele. Minimal malzeme, maksimum protein.',
    time: '12 dk',
  },
  chia: {
    type: 'tip',
    badge: '💡 Pratik Fikir',
    title: 'Chia-Yoğurt Protein Kasesi',
    description:
      'Chia tohumunu yoğurtla karıştır, 5 dakika beklet; üzerine meyve ekle. Soğuk, pratik protein desteği.',
    time: '5 dk',
  },
  elma: {
    type: 'tip',
    badge: '💡 Pratik Fikir',
    title: 'Tavada Tarçınlı Elma Dilimleri',
    description:
      'Elma dilimlerini tavada tarçınla 5 dakika ısıt; yanında lor peyniri ile yüksek proteinli atıştırmalık.',
    time: '7 dk',
  },
}

export function getAlternativeRecipe(foodName) {
  if (!foodName || typeof foodName !== 'string') {
    return { ...FALLBACK_RECIPE }
  }

  const normalized = normalizeFoodText(foodName)

  const indulgentKey = findMatchingKey(
    normalized,
    Object.keys(INDULGENT_RECIPE_MAP),
  )
  if (indulgentKey) {
    return { ...INDULGENT_RECIPE_MAP[indulgentKey] }
  }

  const cleanKey = findMatchingKey(normalized, Object.keys(CLEAN_RECIPE_MAP))
  if (cleanKey) {
    return { ...CLEAN_RECIPE_MAP[cleanKey] }
  }

  return { ...FALLBACK_RECIPE }
}

export const ALTERNATIVE_LOADING_MS = 1500
