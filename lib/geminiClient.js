import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

function extractJson(text) {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) return cleaned.slice(start, end + 1);
  return cleaned;
}

function safeGetText(response) {
  try {
    const t = response.text;
    if (typeof t === 'string') return t.trim();
  } catch (_) {}
  try {
    return (response?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
  } catch (_) {}
  return '';
}

const PROCESSING_RESULT = {
  processing: true,
  diagnostico: '',
  signos: '',
  densidad: '',
  entradas: '',
  coronilla: '',
  tratamientos: '',
  advertencia: '',
  summary: '',
};

export async function analyzeScalpImages(imagePayloads) {
  const apiKey = 'AIzaSyC60RDFsJ_5yLfJs8b8V8e5zbkJ6qNkKPo';

  console.log(`[VIR] Iniciando análisis Gemini (modelo: ${MODEL}) con ${imagePayloads.length} imagen(es)…`);

  try {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1' } });

    const prompt = `Eres un especialista médico capilar. Analiza estas imágenes del cuero cabelludo en español y genera una evaluación preliminar profesional y orientativa.

Evaluá específicamente:
- Densidad capilar general (alta / media / baja / muy baja)
- Estado de las entradas (frontal hairline): retroceso leve, moderado, avanzado o sin retroceso
- Estado de la coronilla (vertex): sin pérdida, pérdida leve, moderada o avanzada
- Signos visibles de alopecia y tipo probable
- Tratamientos médicos o quirúrgicos apropiados según el caso

Incluye siempre una advertencia clara de que esto es solo un diagnóstico preliminar y no reemplaza la consulta médica presencial.

Respondé ÚNICAMENTE con un objeto JSON válido (sin markdown, sin texto extra) con estas claves exactas:
{
  "diagnostico": "tipo de alopecia o condición detectada",
  "signos": "descripción de signos visibles detectados",
  "densidad": "nivel de densidad capilar estimado",
  "entradas": "estado de la línea frontal y entradas",
  "coronilla": "estado de la zona de la coronilla",
  "tratamientos": "tratamientos recomendados",
  "advertencia": "aviso médico obligatorio",
  "summary": "resumen ejecutivo en 1-2 oraciones"
}`;

    const parts = [
      { text: prompt },
      ...imagePayloads.map((image) => ({
        inlineData: {
          mimeType: image.mimeType,
          data: image.base64,
        },
      })),
    ];

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts }],
    });

    const rawText = safeGetText(response);
    console.log(`[VIR] Respuesta Gemini recibida (${rawText.length} chars):`, rawText.slice(0, 200));

    const jsonText = extractJson(rawText);

    try {
      const parsed = JSON.parse(jsonText);
      console.log('[VIR] Diagnóstico parseado correctamente:', parsed.diagnostico);
      return {
        diagnostico: parsed.diagnostico || '',
        signos: parsed.signos || '',
        densidad: parsed.densidad || '',
        entradas: parsed.entradas || '',
        coronilla: parsed.coronilla || '',
        tratamientos: parsed.tratamientos || '',
        advertencia: parsed.advertencia || 'Este análisis es orientativo y no reemplaza la consulta médica presencial.',
        summary: parsed.summary || rawText,
        raw: rawText,
      };
    } catch {
      console.warn('[VIR] No se pudo parsear JSON de Gemini, usando texto completo como diagnóstico.');
      return {
        diagnostico: rawText || 'No se pudo generar un diagnóstico estructurado.',
        signos: '',
        densidad: '',
        entradas: '',
        coronilla: '',
        tratamientos: 'Contactá a la clínica para una evaluación completa.',
        advertencia: 'Este análisis es orientativo y no reemplaza la consulta médica presencial.',
        summary: rawText || 'No se pudo procesar la respuesta de Vir IA.',
        raw: rawText,
      };
    }
  } catch (err) {
    console.error('[VIR] Error en Gemini API:', err.message);
    console.error('[VIR] Stack:', err.stack);
    throw err;
  }
}
