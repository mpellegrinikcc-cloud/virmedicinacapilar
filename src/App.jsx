import { useState, useRef } from 'react';
import BeforeAfterSlider from './components/BeforeAfterSlider';
import { createAssessmentFromPhotos } from './utils/aiAssessment';

const WA = '541136314839';
const WA_URL = `https://wa.me/${WA}`;

const QUIZ_STEPS = [
  {
    id: 'concern',
    question: '¿Qué es lo que más te preocupa?',
    options: ['La caída del cabello', 'Las entradas', 'La coronilla', 'Todo en general'],
  },
  {
    id: 'duration',
    question: '¿Hace cuánto notás la caída?',
    options: ['Menos de 1 año', '1 a 3 años', '3 a 5 años', 'Más de 5 años'],
  },
  {
    id: 'confidence',
    question: '¿Cómo afecta tu confianza?',
    options: ['Mucho, me limita', 'Bastante a diario', 'Algo lo noto', 'Poco por ahora'],
  },
  {
    id: 'previous',
    question: '¿Has probado tratamientos anteriores?',
    options: ['No, nunca', 'Sí, algunos sin resultado', 'Sí, varios tratamientos'],
  },
  {
    id: 'goal',
    question: '¿Qué resultado te gustaría lograr?',
    options: ['Recuperar la densidad', 'Diseñar mi línea frontal', 'Ambas cosas', 'Explorar opciones'],
  },
];

const FAQS = [
  {
    q: '¿El procedimiento es permanente?',
    a: 'Sí. Los folículos trasplantados son genéticamente resistentes a la caída, por lo que los resultados son permanentes. El cabello trasplantado crece, se corta y se peina como el propio.',
  },
  {
    q: '¿Cuánto tiempo tarda en verse el resultado?',
    a: 'Los primeros resultados visibles se aprecian entre los 4 y 6 meses post-operación. El resultado definitivo y completo se observa a los 12 meses.',
  },
  {
    q: '¿El procedimiento es doloroso?',
    a: 'No. Se realiza bajo anestesia local, por lo que durante el procedimiento no se siente dolor. El post-operatorio es muy llevadero con medicación simple.',
  },
  {
    q: '¿Cuánto tiempo dura la intervención?',
    a: 'Dependiendo del número de folículos a trasplantar, entre 4 y 8 horas. Es un procedimiento ambulatorio: el paciente regresa a casa el mismo día.',
  },
  {
    q: '¿Quiénes son buenos candidatos?',
    a: 'Hombres y mujeres con alopecia estable que cuenten con zona donante suficiente. Durante la consulta evaluamos tu caso para darte un diagnóstico personalizado.',
  },
  {
    q: '¿Cuánto cuesta un trasplante capilar?',
    a: 'El costo depende del número de unidades foliculares necesarias. Tras la evaluación, recibís un presupuesto detallado sin compromiso.',
  },
];

function App() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const fileInputRef = useRef(null);

  const TOTAL_STEPS = QUIZ_STEPS.length + 2; // questions + photo + result+form
  const photoStep = QUIZ_STEPS.length;
  const resultStep = QUIZ_STEPS.length + 1;

  function openQuiz() {
    setQuizOpen(true);
    setQuizStep(0);
    setAnswers({});
    setPhotos([]);
    setPreviews([]);
    setSubmitted(false);
    setAssessment(null);
    setAnalysisError(null);
    document.body.style.overflow = 'hidden';
  }

  function closeQuiz() {
    setQuizOpen(false);
    document.body.style.overflow = '';
  }

  function selectOption(stepId, option) {
    setAnswers((prev) => ({ ...prev, [stepId]: option }));
    setTimeout(() => setQuizStep((s) => s + 1), 320);
  }

  function handlePhotos(e) {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setPhotos(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function buildWaMessage() {
    const lines = [
      `Hola Vir Medicina Capilar, completé el diagnóstico en línea.`,
      ``,
      `*Nombre:* ${formData.name}`,
      `*Teléfono:* ${formData.phone}`,
      ``,
      `*Preocupación:* ${answers.concern || '—'}`,
      `*Tiempo de caída:* ${answers.duration || '—'}`,
      `*Impacto en confianza:* ${answers.confidence || '—'}`,
      `*Tratamientos previos:* ${answers.previous || '—'}`,
      `*Objetivo:* ${answers.goal || '—'}`,
    ];
    if (assessment) {
      lines.push(``, `*Diagnóstico IA:*`, assessment.stage);
      lines.push(`*Densidad:* ${assessment.density}`);
      lines.push(`*Línea frontal:* ${assessment.hairline}`);
    }
    return encodeURIComponent(lines.join('\n'));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  const progressPct = ((quizStep) / (TOTAL_STEPS - 1)) * 100;

  return (
    <>
      {/* ─── NAV ─────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-logo">
          <svg className="nav-logo-icon" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 4 L18 36 L32 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M10 4 L18 22 L26 4" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7"/>
          </svg>
          <div className="nav-logo-text">
            <span className="nav-logo-name">VIR</span>
            <span className="nav-logo-sub">Medicina Capilar</span>
          </div>
        </div>
        <ul className="nav-links">
          <li><a href="#resultados">Resultados</a></li>
          <li><a href="#proceso">Proceso</a></li>
          <li><a href="#testimonios">Pacientes</a></li>
          <li><a href="#faq">Preguntas</a></li>
        </ul>
        <a className="nav-cta" href={WA_URL} target="_blank" rel="noreferrer">
          <span>💬</span> WhatsApp
        </a>
      </nav>

      {/* ─── HERO ────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">Vir Medicina Capilar</div>
          <h1>
            Recuperá tu cabello.<br />
            Recuperá tu <em>confianza.</em>
          </h1>
          <p className="hero-sub">
            Trasplante capilar premium. Hecho por especialistas, entregado con discreción.
            Resultados permanentes y naturales que transforman vidas.
          </p>
          <div className="hero-actions">
            <button className="btn-gold" onClick={openQuiz}>
              Descubrí tu candidatura →
            </button>
            <a className="btn-ghost" href="#resultados">
              Ver resultados
            </a>
          </div>
        </div>
        <div className="hero-scroll-hint">Explorá</div>
      </section>

      {/* ─── FEATURES ────────────────────────────── */}
      <section className="features">
        <div className="container">
          <div className="features-header">
            <p className="section-eyebrow">Por qué elegir VIR</p>
            <h2 className="section-title">
              Hecho por especialistas.<br />
              Entregado con <em>discreción.</em>
            </h2>
            <p className="section-sub">
              Cada caso es único. Por eso combinamos tecnología avanzada con una atención
              médica verdaderamente personalizada.
            </p>
          </div>
          <div className="features-grid">
            {[
              { icon: '🔬', title: 'Técnica FUE de última generación', desc: 'Extracción folicular unitaria que garantiza cicatrices mínimas y recuperación acelerada.' },
              { icon: '🎯', title: 'Diseño personalizado de línea frontal', desc: 'Trazamos tu nueva línea respetando proporciones faciales y aspecto completamente natural.' },
              { icon: '🔒', title: 'Confidencialidad absoluta', desc: 'Tu privacidad es nuestra prioridad. Cada consulta y procedimiento se maneja con máxima discreción.' },
              { icon: '📋', title: 'Diagnóstico digital previo', desc: 'Analizamos tu caso con IA antes de la consulta para llegar con un plan ya estructurado.' },
              { icon: '💊', title: 'Seguimiento post-operatorio', desc: 'Acompañamos cada etapa del crecimiento con controles médicos y atención directa.' },
              { icon: '✨', title: 'Resultados naturales garantizados', desc: 'Ningún paciente se va sin el resultado que vino a buscar. Ese es nuestro compromiso.' },
            ].map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DOCTOR ──────────────────────────────── */}
      <section style={{ padding: '100px 40px' }}>
        <div className="container">
          <div className="doctor-section">
            <div className="doctor-image-wrap">
              <div className="doctor-placeholder">
                <div className="doctor-placeholder-icon">👨‍⚕️</div>
                <p style={{ fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Foto del médico
                </p>
              </div>
              <div className="doctor-tag">
                <strong>Dr. Especialista VIR</strong>
                <span>Cirugía de Restauración Capilar</span>
              </div>
            </div>
            <div className="doctor-content">
              <p className="section-eyebrow">El médico</p>
              <h2 className="section-title">
                Un médico.<br />
                Un compromiso <em>personal.</em>
              </h2>
              <p className="section-sub" style={{ marginBottom: 0 }}>
                Cada paciente es atendido directamente por el médico especialista, desde
                la primera consulta hasta el control final. No somos una franquicia.
                Somos un equipo que se compromete con cada caso como si fuera el único.
              </p>
              <div className="doctor-stats">
                {[
                  { n: '+800', label: 'Pacientes tratados' },
                  { n: '8+', label: 'Años de experiencia' },
                  { n: '98%', label: 'Satisfacción' },
                  { n: '4.9★', label: 'Valoración media' },
                ].map((s) => (
                  <div className="stat-item" key={s.label}>
                    <div className="stat-number">{s.n}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ──────────────────────────── */}
      <section className="cta-banner">
        <div className="container">
          <p className="section-eyebrow" style={{ textAlign: 'center' }}>Sin compromiso</p>
          <h2 className="section-title" style={{ margin: '0 auto 32px' }}>
            Descubrí tu candidatura<br />en <em>dos minutos.</em>
          </h2>
          <p className="section-sub" style={{ margin: '0 auto 40px', textAlign: 'center' }}>
            Respondé 5 preguntas rápidas, subí una foto de tu cabello y recibí
            un diagnóstico preliminar con IA al instante.
          </p>
          <button className="btn-gold" onClick={openQuiz}>
            Iniciar diagnóstico gratuito →
          </button>
        </div>
      </section>

      {/* ─── BEFORE / AFTER SLIDER ───────────────── */}
      <section id="resultados" style={{ padding: '100px 40px' }}>
        <div className="container">
          <div className="results-header">
            <div>
              <p className="section-eyebrow">Transformaciones reales</p>
              <h2 className="section-title">
                Resultados naturales.<br />
                <em>Trasformaciones</em> reales.
              </h2>
            </div>
            <button className="btn-ghost" onClick={openQuiz}>
              Quiero el mío →
            </button>
          </div>
          <BeforeAfterSlider />
          <p style={{ textAlign: 'center', color: 'var(--gray)', fontSize: '0.82rem', marginTop: '16px' }}>
            Arrastrá el control para comparar • Resultados reales de pacientes VIR
          </p>
        </div>
      </section>

      {/* ─── JOURNEY / STEPS ─────────────────────── */}
      <section className="journey-section" id="proceso">
        <div className="container">
          <p className="section-eyebrow">El camino</p>
          <h2 className="section-title">
            La restauración es un viaje.<br />
            <em>Lo hacemos</em> inolvidable.
          </h2>
          <p className="section-sub">
            Cinco pasos. Un resultado. Un equipo que te acompaña en cada etapa.
          </p>
          <div className="steps-grid">
            {[
              { n: '01', title: 'Diagnóstico digital', desc: 'Completás el formulario online y recibís una evaluación preliminar.' },
              { n: '02', title: 'Consulta médica', desc: 'El médico evalúa tu caso en persona y diseña el plan personalizado.' },
              { n: '03', title: 'Procedimiento FUE', desc: 'Intervención en un día, sin internación, con anestesia local.' },
              { n: '04', title: 'Recuperación', desc: 'Alta el mismo día. Post-operatorio simple con indicaciones claras.' },
              { n: '05', title: 'Resultado definitivo', desc: 'A los 12 meses observás el resultado completo y permanente.' },
            ].map((s) => (
              <div className="step-card" key={s.n}>
                <div className="step-number">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────── */}
      <section id="testimonios" style={{ padding: '100px 40px' }}>
        <div className="container">
          <p className="section-eyebrow">Pacientes reales</p>
          <h2 className="section-title">Pacientes que <em>eligieron</em> VIR.</h2>
          <div className="testimonials-grid">
            {[
              { name: 'Martín G.', detail: 'Trasplante FUE · 2024', text: 'No podía creer el resultado. A los 8 meses nadie notó que me hice nada, solo que "me veía bien". Ese era exactamente el objetivo.', init: 'M' },
              { name: 'Facundo R.', detail: 'Trasplante FUE · 2023', text: 'La atención es increíble. Te explican todo, no hay letra chica. El médico te atiende él mismo, no un técnico. Vale cada peso.', init: 'F' },
              { name: 'Santiago L.', detail: 'Tratamiento capilar · 2024', text: 'Llevaba años postergando esto por miedo. El proceso fue mucho más simple de lo que imaginaba. Ya estoy pensando en hacerme la segunda sesión.', init: 'S' },
            ].map((t) => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.init}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-detail">{t.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────── */}
      <section className="faq-section" id="faq">
        <div className="container">
          <p className="section-eyebrow">Preguntas frecuentes</p>
          <h2 className="section-title">Todo lo que querías <em>preguntar.</em></h2>
          <div className="faq-grid">
            <div className="faq-list">
              {FAQS.map((item, i) => (
                <div className={`faq-item${openFaq === i ? ' open' : ''}`} key={i}>
                  <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {item.q}
                    <span className="faq-toggle">+</span>
                  </button>
                  <div className="faq-answer">{item.a}</div>
                </div>
              ))}
            </div>
            <div className="faq-cta-card">
              <p className="section-eyebrow">¿Tenés más dudas?</p>
              <h3>Hablemos directamente sin compromiso</h3>
              <p>
                Nuestro equipo responde todas tus preguntas por WhatsApp. Sin turnos, sin formularios,
                sin esperas.
              </p>
              <a className="btn-gold" href={WA_URL} target="_blank" rel="noreferrer">
                💬 Escribir por WhatsApp
              </a>
              <button className="btn-ghost" onClick={openQuiz}>
                Hacer el diagnóstico →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────── */}
      <section className="final-cta">
        <div className="container">
          <p className="section-eyebrow">Empezá hoy</p>
          <h2 className="section-title">
            El mejor momento<br />
            para recuperar tu <em>cabello.</em>
          </h2>
          <p className="section-sub">
            El segundo mejor momento es ahora. Hacé el diagnóstico gratuito en 2 minutos
            y conocé si sos candidato.
          </p>
          <div className="final-cta-actions">
            <button className="btn-gold" onClick={openQuiz}>
              Iniciar diagnóstico gratuito →
            </button>
            <a className="btn-ghost" href={WA_URL} target="_blank" rel="noreferrer">
              💬 WhatsApp directo
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────── */}
      <footer className="footer">
        <div className="footer-logo">VIR<span>.</span></div>
        <p className="footer-copy">© {new Date().getFullYear()} Vir Medicina Capilar · Todos los derechos reservados</p>
        <a className="nav-cta" href={WA_URL} target="_blank" rel="noreferrer">
          💬 Contacto
        </a>
      </footer>

      {/* ─── FLOATING WA ─────────────────────────── */}
      <a className="wa-float" href={WA_URL} target="_blank" rel="noreferrer" title="WhatsApp">
        💬
      </a>

      {/* ─── QUIZ OVERLAY ────────────────────────── */}
      {quizOpen && (
        <div className="quiz-overlay">
          {/* Header */}
          <div className="quiz-overlay-header">
            <div className="nav-logo">
              <svg className="nav-logo-icon" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 4 L18 36 L32 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M10 4 L18 22 L26 4" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7"/>
              </svg>
              <div className="nav-logo-text">
                <span className="nav-logo-name">VIR</span>
                <span className="nav-logo-sub">Medicina Capilar</span>
              </div>
            </div>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="quiz-step-label">
              {quizStep < resultStep ? `${quizStep + 1} / ${TOTAL_STEPS}` : 'Resultado'}
            </span>
            <button className="quiz-close" onClick={closeQuiz}>✕</button>
          </div>

          {/* Body */}
          <div className="quiz-body">

            {/* ── Multiple choice steps ── */}
            {quizStep < QUIZ_STEPS.length && (
              <div className="quiz-card" key={quizStep}>
                <h2 className="quiz-question">{QUIZ_STEPS[quizStep].question}</h2>
                <div className="quiz-options">
                  {QUIZ_STEPS[quizStep].options.map((opt, i) => (
                    <button
                      key={opt}
                      className={`quiz-option${answers[QUIZ_STEPS[quizStep].id] === opt ? ' selected' : ''}`}
                      onClick={() => selectOption(QUIZ_STEPS[quizStep].id, opt)}
                    >
                      <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Photo upload step ── */}
            {quizStep === photoStep && (
              <div className="quiz-card" key="photo">
                <h2 className="quiz-question">Subí una foto de tu cabello</h2>
                <p style={{ color: 'var(--gray-light)', marginBottom: '24px', fontSize: '0.95rem' }}>
                  Tomá una foto de la coronilla, la línea frontal o la zona de mayor preocupación.
                  Tu imagen es privada y solo se usa para el diagnóstico.
                </p>
                <label className="quiz-photo-drop">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotos}
                  />
                  <div className="quiz-photo-icon">📷</div>
                  <h3>
                    {photos.length > 0
                      ? `${photos.length} foto${photos.length > 1 ? 's' : ''} seleccionada${photos.length > 1 ? 's' : ''}`
                      : 'Tocá para seleccionar fotos'}
                  </h3>
                  <p>Hasta 4 imágenes · JPG o PNG</p>
                </label>
                {previews.length > 0 && (
                  <div className="quiz-photos-preview">
                    {previews.map((url, i) => (
                      <img key={i} src={url} alt={`Foto ${i + 1}`} className="quiz-photo-thumb" />
                    ))}
                  </div>
                )}
                {analysisError && (
                  <p style={{ color: '#ef4444', fontSize: '0.88rem', marginTop: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)' }}>
                    ⚠ {analysisError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button
                    className="btn-gold"
                    style={{ flex: 1 }}
                    disabled={isAnalyzing}
                    onClick={async () => {
                      setAnalysisError(null);
                      if (photos.length === 0) {
                        setAnalysisError('Necesitás subir al menos una foto para obtener el diagnóstico de IA.');
                        return;
                      }
                      setIsAnalyzing(true);
                      try {
                        const result = await createAssessmentFromPhotos(photos);
                        setAssessment(result);
                        setQuizStep((s) => s + 1);
                      } catch (err) {
                        setAnalysisError(err.message);
                      } finally {
                        setIsAnalyzing(false);
                      }
                    }}
                  >
                    Ver mi diagnóstico →
                  </button>
                </div>
              </div>
            )}

            {/* ── Result + Form step ── */}
            {quizStep === resultStep && assessment && (
              <div className="quiz-card" key="result">
                {!submitted ? (
                  <>
                    <div className="quiz-result">
                      <div className="quiz-result-badge">✓ Diagnóstico IA completado</div>
                      <h2>Escala Norwood: {assessment.stage}</h2>
                      <p>
                        Tu análisis capilar fue procesado por inteligencia artificial.
                        Completá tus datos para recibir la evaluación completa del médico especialista.
                      </p>

                      <div className="quiz-assessment-cards">
                        {[
                          { label: 'Escala Norwood', value: assessment.stage },
                          { label: 'Densidad capilar', value: assessment.density },
                          { label: 'Zona donante', value: assessment.donorQuality },
                          { label: 'Línea frontal', value: assessment.hairline },
                        ].map((c) => (
                          <div className="quiz-assessment-card" key={c.label}>
                            <div className="label">{c.label}</div>
                            <div className="value">{c.value}</div>
                          </div>
                        ))}
                      </div>

                      {assessment.recommendations && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 8, textAlign: 'left' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Recomendación IA</div>
                          <p style={{ color: 'var(--gray-light)', fontSize: '0.9rem', margin: 0 }}>{assessment.recommendations}</p>
                        </div>
                      )}
                    </div>

                    <form className="quiz-form" onSubmit={handleSubmit}>
                      <h3 className="quiz-form-title">Recibí tu diagnóstico completo</h3>
                      <p className="quiz-form-sub">
                        El médico especialista te contacta dentro de las 24 hs hábiles para confirmar
                        tu candidatura y coordinar la consulta.
                      </p>
                      {[
                        { id: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre' },
                        { id: 'phone', label: 'Teléfono / WhatsApp', type: 'tel', placeholder: '+54 9 11 ...' },
                      ].map((f) => (
                        <div className="form-field" key={f.id}>
                          <label htmlFor={f.id}>{f.label}</label>
                          <input
                            id={f.id}
                            name={f.id}
                            type={f.type}
                            placeholder={f.placeholder}
                            className="form-input"
                            value={formData[f.id]}
                            onChange={handleFormChange}
                            required
                          />
                        </div>
                      ))}
                      <button type="submit" className="btn-gold" style={{ width: '100%', justifyContent: 'center' }}>
                        Enviar diagnóstico
                      </button>
                      <a
                        className="btn-whatsapp"
                        href={`${WA_URL}?text=${buildWaMessage()}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        💬 Escribir por WhatsApp ahora
                      </a>
                    </form>
                  </>
                ) : (
                  <div className="quiz-result" style={{ textAlign: 'center' }}>
                    <div className="quiz-result-badge">✓ Diagnóstico registrado</div>
                    <h2>¡Perfecto, {formData.name || 'te contactamos pronto'}!</h2>
                    <p>
                      El médico especialista revisará tu caso y te contactará por WhatsApp
                      dentro de las 24 hs hábiles.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                      <a
                        className="btn-whatsapp"
                        href={`${WA_URL}?text=${buildWaMessage()}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        💬 WhatsApp directo
                      </a>
                      <button className="btn-ghost" onClick={closeQuiz} style={{ justifyContent: 'center' }}>
                        Volver a la web
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {isAnalyzing && (
            <div className="quiz-analyzing-overlay">
              <div className="quiz-spinner" />
              <p className="quiz-analyzing-text">Analizando tu cabello con IA...</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
