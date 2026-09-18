import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// GÜNCELLENDİ: JSON formatına "warning" alanı eklendi
const BASE_SYSTEM_PROMPT = `Sen profesyonel bir yapay zeka diyetisyenisin. Görevin, sana verilen metni veya fotoğrafı analiz edip SADECE aşağıdaki JSON formatında cevap vermektir. Başka hiçbir açıklama, markdown işareti (\`\`\`json vb.) veya metin ekleme.
Format: {"name": "Besin Adı", "calories": 100, "protein": 10, "carbs": 20, "fat": 5, "warning": "Kullanıcının hastalığına risk oluşturuyorsa uyarı yaz, yoksa boş bırak"}`;

function cleanAndParseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("JSON parse hatası detayı:", error, "Gelen Metin:", text);
    throw new Error("Yapay zeka geçerli bir JSON döndürmedi.");
  }
}

// YENİ: Kullanıcı profilini yapay zekanın anlayacağı talimatlara çeviren köprü
function buildPromptWithProfile(userText, userProfile) {
  let prompt = BASE_SYSTEM_PROMPT;

  if (userProfile) {
    const diseasesText = userProfile.diseases?.length > 0 ? userProfile.diseases.join(', ') : 'Yok';
    const breastfeedingText = userProfile.isBreastfeeding ? 'Evet (Günlük enerji ve sıvı ihtiyacı artmıştır)' : 'Hayır';
    
    prompt += `\n\nKULLANICI PROFİLİ (Besini analiz ederken mutlaka bu durumu göz önünde bulundur):
    - Beden Kitle İndeksi (BKİ): ${userProfile.bmi} (${userProfile.bmiCategory})
    - Kronik Hastalıklar: ${diseasesText}
    - Emzirme Durumu: ${breastfeedingText}
    - Aktivite Seviyesi: ${userProfile.activityLabel || 'Bilinmiyor'}
    
    ÖNEMLİ GÖREV: Eğer kullanıcının kronik hastalığı (örneğin Diyabet) analiz ettiğin bu besinle (örneğin aşırı şekerli tatlı) ters düşüyorsa, JSON formatındaki 'warning' alanına empatik ama uyarıcı kısa bir mesaj yaz. Eğer besin profiline uygunsa 'warning' alanını boş ("") bırak.`;
  }

  prompt += `\n\nKullanıcı Girdisi: "${userText}"`;
  return prompt;
}

// GÜNCELLENDİ: Fonksiyon artık userProfile parametresi alıyor
export async function analyzeFoodWithAI(userText, userProfile = null) {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("Gemini API Anahtarı eksik!");
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
  const prompt = buildPromptWithProfile(userText, userProfile);

  const result = await model.generateContent(prompt);
  return cleanAndParseJSON(result.response.text());
}

// GÜNCELLENDİ: Fonksiyon artık userProfile parametresi alıyor
export async function analyzeFoodImageWithGemini(base64Image, userProfile = null) {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("Gemini API Anahtarı eksik!");
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
  const prompt = buildPromptWithProfile(
    "Bu fotoğraftaki yemeği/yemekleri analiz et, tahmini porsiyonunu düşünerek makrobesin değerlerini hesapla.", 
    userProfile
  );

  const imageParts = [{
    inlineData: {
      data: base64Image.split(',')[1],
      mimeType: "image/jpeg"
    }
  }];

  const result = await model.generateContent([prompt, ...imageParts]);
  return cleanAndParseJSON(result.response.text());
}

// GÜNCELLENDİ: Warning (uyarı) mesajı da listeye eklendi
export function createMealFromAIAnalysis(analysis, searchInput = "Fotoğraf Analizi") {
  return {
    id: crypto.randomUUID(),
    name: `${analysis.name} - ${analysis.calories} kcal`,
    searchInput: searchInput.trim(),
    addedAt: new Date(),
    calories: analysis.calories,
    protein: analysis.protein,
    carbs: analysis.carbs,
    fat: analysis.fat,
    fiber: 0,
    warning: analysis.warning || null, // UI'da göstermek için uyarıyı yakalıyoruz
    source: 'gemini-vision-ai',
  }
}
// Premium Diyet Listesi Oluşturucu
export async function generatePremiumDietPlan(profile, dailyCalories, macroTargets) {
  if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error("Gemini API Anahtarı eksik!");
  
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
  
  const prompt = `Sen profesyonel ve modern bir yapay zeka diyetisyenisin. Kullanıcının özelliklerine, günlük kalori hedefine ve makrolarına tam uyan, uygulanabilir, lezzetli ve sağlıklı bir 1 günlük diyet listesi hazırla.
  
  KULLANICI BİLGİLERİ:
  - Günlük Hedef: ${dailyCalories} kcal
  - Makrolar: ${macroTargets.protein}g Protein, ${macroTargets.carbs}g Karbonhidrat, ${macroTargets.fat}g Yağ
  - Kronik Hastalıklar: ${profile.diseases?.length > 0 ? profile.diseases.join(', ') : 'Yok'}
  - Emzirme Durumu: ${profile.isBreastfeeding ? 'Evet' : 'Hayır'}
  
  LÜTFEN SADECE AŞAĞIDAKİ JSON FORMATINDA CEVAP VER. Başka hiçbir metin ekleme. İçerik detaylarında pratik malzemeler (örn: yulaf, chia tohumu, fıstık ezmesi, yumurta, süzme peynir, ton balığı, tavuk göğsü vb.) kullanmaya özen göster.
  
  {
    "breakfast": { "title": "Kahvaltı Adı", "description": "İçerik ve porsiyon detayı", "calories": 400 },
    "snack1": { "title": "1. Ara Öğün", "description": "İçerik detayı", "calories": 200 },
    "lunch": { "title": "Öğle Yemeği", "description": "İçerik detayı", "calories": 600 },
    "snack2": { "title": "2. Ara Öğün", "description": "İçerik detayı", "calories": 200 },
    "dinner": { "title": "Akşam Yemeği", "description": "İçerik detayı", "calories": 700 },
    "motivation": "Kullanıcının profiline uygun kısa, motive edici bir cümle."
  }`;

  const result = await model.generateContent(prompt);
  return cleanAndParseJSON(result.response.text());
}