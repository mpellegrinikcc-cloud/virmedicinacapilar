const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const PROMPT = `Analizá esta foto capilar y determiná con precisión médica: escala Norwood, densidad en coronilla y estado de las entradas. Devolve el resultado en un formato profesional para el paciente.

Respondé ÚNICAMENTE en formato JSON con esta estructura exacta (sin markdown, sin texto extra):
{
  "stage": "escala Norwood exacta observada (ej: Norwood III-IV)",
  "density": "evaluación precisa de la densidad en coronilla",
  "donorQuality": "calidad de la zona donante visible",
  "hairline": "estado de las entradas",
  "recommendations": "recomendación clínica profesional y personalizada para el paciente"
}`;


function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function createAssessmentFromPhotos(files) {
  if (!files || files.length === 0) return null;

  const file = files[0];
  const base64 = await fileToBase64(file);

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: file.type || 'image/jpeg', data: base64 } },
          ],
        },
      ],
      generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Error al conectar con Gemini (${response.status})`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('La IA no devolvió un diagnóstico válido. Intentá con otra foto más clara.');

  const parsed = JSON.parse(match[0]);
  const required = ['stage', 'density', 'donorQuality', 'hairline', 'recommendations'];
  const missing = required.filter((k) => !parsed[k]);
  if (missing.length > 0) {
    throw new Error(`Diagnóstico incompleto de la IA: faltan los campos ${missing.join(', ')}. Intentá nuevamente.`);
  }
  return parsed;
}
