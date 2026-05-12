'use client';

import { useState, useRef } from 'react';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

const WA = '541136314839';
const WA_MSG_GENERAL = encodeURIComponent('Hola, quiero recibir información sobre sus tratamientos');
const WA_MSG_TEST    = encodeURIComponent('Hola, acabo de completar mi test en la web y quería mi diagnóstico preliminar');
const WA_URL_GENERAL = `https://wa.me/${WA}?text=${WA_MSG_GENERAL}`;
const WA_URL_TEST    = `https://wa.me/${WA}?text=${WA_MSG_TEST}`;

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
    options: ['Mucho, me limita a diario', 'Bastante', 'Algo', 'Poco por ahora'],
  },
  {
    id: 'previous',
    question: '¿Has probado tratamientos anteriores?',
    options: ['No, nunca', 'Sí, algunos sin resultado', 'Sí, varios tratamientos'],
  },
  {
    id: 'goal',
    question: '¿Qué resultado te gustaría lograr?',
    options: ['Recuperar la densidad', 'Diseñar mi línea frontal', 'Recuperar zona coronilla', 'Ambas cosas'],
  },
];

const FAQS = [
  { q: '¿El procedimiento es permanente?', a: 'Sí. Los folículos trasplantados son genéticamente resistentes a la caída. El cabello crece, se corta y se peina como el propio para siempre.' },
  { q: '¿Cuánto tiempo tarda en verse el resultado?', a: 'Los primeros resultados visibles aparecen entre los 4 y 6 meses. El resultado definitivo se observa a los 12 meses post-procedimiento.' },
  { q: '¿El procedimiento es doloroso?', a: 'No. Se realiza bajo anestesia local, por lo que durante el procedimiento no se siente dolor. El post-operatorio es muy llevadero con medicación simple.' },
  { q: '¿Cuánto tiempo dura la intervención?', a: 'Entre 4 y 8 horas dependiendo del número de folículos. Es ambulatorio: el paciente regresa a su casa el mismo día.' },
  { q: '¿Quiénes son buenos candidatos?', a: 'Hombres y mujeres con alopecia estable que cuenten con zona donante suficiente. En la consulta evaluamos tu caso y te damos un diagnóstico personalizado.' },
  { q: '¿Cuánto cuesta un trasplante capilar?', a: 'El costo depende del número de unidades foliculares necesarias. Tras la evaluación recibís un presupuesto detallado sin compromiso.' },
];

const PHOTO_STEP  = QUIZ_STEPS.length;          // 5
const FORM_STEP   = QUIZ_STEPS.length + 1;       // 6
const RESULT_STEP = QUIZ_STEPS.length + 2;       // 7  ← Paso 8 (UI 1-indexed)
const TOTAL       = QUIZ_STEPS.length + 3;       // 8

export default function Home() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [step, setStep]         = useState(0);
  const [answers, setAnswers]   = useState({});
  const [files, setFiles]       = useState([]);
  const [previews, setPreviews] = useState([]);
  const [form, setForm]         = useState({ nombre: '', whatsapp: '', email: '', edad: '', comentarios: '', human: false, bot: '' });
  const [phase, setPhase]       = useState('idle'); // idle | loading | success | error
  const [result, setResult]     = useState(null);
  const [apiError, setApiError] = useState('');
  const [openFaq, setOpenFaq]   = useState(null);

  const fileRef = useRef(null);

  function openQuiz() {
    setQuizOpen(true);
    setStep(0);
    setAnswers({});
    setFiles([]);
    setPreviews([]);
    setForm({ nombre: '', whatsapp: '', email: '', edad: '', comentarios: '', human: false, bot: '' });
    setPhase('idle');
    setResult(null);
    setApiError('');
    document.body.style.overflow = 'hidden';
  }

  function closeQuiz() {
    setQuizOpen(false);
    document.body.style.overflow = '';
  }

  function pickOption(stepId, opt) {
    setAnswers((prev) => ({ ...prev, [stepId]: opt }));
    setTimeout(() => setStep((s) => s + 1), 300);
  }

  function handleFiles(e) {
    const selected = Array.from(e.target.files || []).slice(0, 3);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }

  function setField(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  const canSubmit =
    files.length <= 3 &&
    form.nombre.trim() && form.whatsapp.trim() && form.edad.trim() &&
    form.human && form.bot === '';

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    if (!canSubmit) { setApiError('Completá todos los campos obligatorios y confirmá que sos humano.'); return; }

    setPhase('loading');
    const body = new FormData();
    files.forEach((f) => body.append('images', f));
    body.append('nombre',      form.nombre);
    body.append('whatsapp',    form.whatsapp);
    body.append('email',       form.email);
    body.append('edad',        form.edad);
    body.append('comentarios', form.comentarios);
    body.append('bot',         form.bot);

    await Promise.all([
      fetch('/api/submit', { method: 'POST', body }).catch((err) =>
        console.error('[VIR] Error al enviar:', err.message)
      ),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);

    setPhase('success');
    setStep(RESULT_STEP);
  }

  function buildWaMessage() {
    const lines = [
      `Hola Vir, completé el diagnóstico online.`,
      ``,
      `*Nombre:* ${form.nombre}`,
      `*Teléfono:* ${form.whatsapp}`,
      `*Edad:* ${form.edad}`,
      ``,
      `*Preocupación:* ${answers.concern   || '—'}`,
      `*Tiempo de caída:* ${answers.duration  || '—'}`,
      `*Impacto en confianza:* ${answers.confidence || '—'}`,
      `*Tratamientos previos:* ${answers.previous  || '—'}`,
      `*Objetivo:* ${answers.goal      || '—'}`,
    ];
    return encodeURIComponent(lines.join('\n'));
  }

  const progress = Math.round((step / (TOTAL - 1)) * 100);

  return (
    <>
      {/* ── NAV ──────────────────────────────────── */}
      <nav className="nav">
        <div className="nav-logo-group">
          <img src="/logo-icon.jpeg" alt="VIR" width="36" height="40" style={{ filter: 'invert(1)', objectFit: 'contain' }} />
        </div>
        <div className="nav-availability">
          <span className="nav-availability-dot" />
          DISPONIBILIDAD LIMITADA
        </div>
        <button className="nav-cta-pill" onClick={openQuiz}>
          Iniciar diagnóstico →
        </button>
      </nav>

      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <p className="hero-eyebrow">MEDICINA CAPILAR PREMIUM · DESDE 2020</p>
          <h1>
            Recuperá tu cabello.<br />
            Recuperá tu{' '}
            <span className="hero-gold">confianza.</span>
          </h1>
          <p className="hero-sub">
            Resultados capilares naturales. Tecnología avanzada. Atención médica premium. La experiencia que está redefiniendo la medicina capilar en Buenos Aires.
          </p>
          <div className="hero-actions">
            <button className="btn-gold" onClick={openQuiz}>
              Iniciar mi diagnóstico →
            </button>
            <a className="btn-ghost" href="#resultados">Ver resultados reales →</a>
          </div>
        </div>
        <img src="/logo-full.jpeg" alt="" className="hero-watermark" aria-hidden="true" style={{ right: '12%' }} />
        <span className="hero-scroll-hint">Explorá</span>
      </section>

      {/* ── DOLOR ALOPECIA ── */}
<section className="vir-section features-bg">
  <div className="container">
    <p className="section-eyebrow">Lo que nadie dice en voz alta</p>
    <h2 className="section-title">
      Perder el pelo no es solo perder{' '}
      <span className="section-title-gold">cabello.</span>
    </h2>
    <p className="section-sub" style={{maxWidth:600,marginBottom:16}}>
      Es algo que se instala despacio. Primero lo notás vos solo. Después lo dicen los demás — con una palabra, con un apodo, con un silencio. Y antes de que te des cuenta, dejaste de ser vos para ser "el pelado".
    </p>
    <div style={{borderLeft:'2px solid #c9a97a',paddingLeft:20,marginBottom:56,maxWidth:560}}>
      <p className="section-sub" style={{margin:0}}>
        <strong style={{color:'#c9a97a'}}>En VIR atendemos alopecia desde 2020.</strong> Cada dolor que describimos acá lo escuchamos en consulta, de personas reales. Sabemos exactamente en qué punto estás — y sabemos cómo salir de ahí.
      </p>
    </div>
    <div className="features-grid">
      {[
        { n:'01 / 06', img:'/pain-01.png', title:'Dejás de tener nombre', desc:'"El pelado", "Bola 8", "Pela". Un apodo reemplaza tu nombre, tu historia, tu personalidad. Pasan años y la gente te sigue llamando así. La alopecia no solo cambia cómo te ven — cambia cómo te nombran.', vir:'En VIR entendemos que esto no es un problema estético. Es de identidad.' },
        { n:'02 / 06', img:'/pain-02.png', title:'La seguridad que se va con el pelo', desc:'Reuniones, salidas, primeras citas. Situaciones donde antes entrabas sin pensarlo. Ahora hay un ruido de fondo que no para: ¿me está mirando la cabeza? ¿se nota más con esta luz? Ese desgaste mental es real, y es agotador.', vir:'Identificamos la causa antes de proponer cualquier tratamiento.' },
        { n:'03 / 06', img:'/pain-03.png', title:'El mercado laboral no es neutral', desc:'Dos candidatos iguales en habilidades. Uno con pelo, uno sin. Los estudios lo confirman y muchos lo vivieron: la imagen proyecta autoridad, dinamismo, energía. La alopecia juega en contra en la primera impresión.', vir:'Un resultado natural de VIR cambia esa ecuación desde la primera consulta.' },
        { n:'04 / 06', img:'/pain-04.png', title:'La virilidad en juego', desc:'Competir por una mujer sabiendo que el otro tiene pelo. Sentirse menos presente, menos atractivo, menos entero. No porque sea verdad — sino porque la alopecia instala esa duda y no se va sola. Esa sensación de estar "fuera de juego" tiene solución.', vir:'Nuestros pacientes describen un cambio en su vida amorosa a los 6 meses.' },
        { n:'05 / 06', img:'/pain-05.png', title:'Envejecer antes de tiempo', desc:'Que alguien te llame "señor" cuando tenés 32. Que en una foto con amigos parezcas el mayor sin serlo. La alopecia roba años que todavía tenés — y los devuelve cuando el cabello vuelve.', vir:'El resultado de VIR es permanente. No lo vas a tener que repetir.' },
        { n:'06 / 06', img:'/pain-06.png', title:'El cansancio de probar todo', desc:'Shampoos, suplementos, lociones, "remedios naturales". Cada cosa prometía y ninguna cumplió. No fallaste vos — te fallaron los productos. La alopecia tiene causa médica y necesita solución médica.', vir:'Sin diagnóstico real, cualquier tratamiento es un gasto. Empezá por ahí.' },
      ].map((f) => (
        <div className="feature-card" key={f.title} style={{padding:0,overflow:'hidden'}}>
          <img src={f.img} alt={f.title} style={{width:'100%',height:200,objectFit:'cover',display:'block',filter:'brightness(0.75)'}} />
          <div style={{padding:'20px 24px 24px'}}>
            <p style={{fontSize:11,letterSpacing:'0.12em',color:'#3d3830',marginBottom:10}}>{f.n}</p>
           <h3 style={{color:'#C4983A',fontStyle:'italic',fontSize:'1.1rem',marginBottom:10}}>{f.title}</h3>
           <p style={{fontSize:'1.1rem',color:'var(--gray-light)',fontWeight:400,marginBottom:12}}>{f.desc}</p>
            <p style={{color:'#c9a97a',fontSize:'11px',borderTop:'1px solid #1e1b17',paddingTop:10,fontStyle:'italic',margin:0}}>{f.vir}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ── DOCTOR ───────────────────────────────── */}
      <section className="vir-section">
        <div className="container">
          <div className="doctor-grid">
            <div className="doctor-image-wrap">
              <img src="/doctor.jpeg" alt="Dr. Isaac Rosales Vergara" className="doctor-photo" />
              <div className="doctor-tag">
                <span style={{ display: 'block', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>UN MÉDICO ESPECIALIZADO</span>
                <strong>Dr. Isaac Rosales Vergara</strong>
              </div>
            </div>
            <div>
              <p className="section-eyebrow">DETRÁS DE CADA RESULTADO</p>
              <h2 className="section-title">
                Un médico.<br />
                Un compromiso{' '}
                <span className="section-title-gold">personal.</span>
              </h2>
              <p className="section-sub" style={{ marginBottom: 16 }}>
                El Dr. Isaac Rosales Vergara, director médico de Vir, acompaña
                personalmente cada caso desde la primera consulta hasta el seguimiento
                final. Define el plan clínico, el diseño de tu línea frontal y cada
                decisión que protege tu resultado.
              </p>
              <p className="section-sub" style={{ marginBottom: 0 }}>
                El procedimiento es realizado por nuestro equipo de médicos cirujanos
                certificados, que trabajan junto al Dr. Rosales bajo un mismo criterio
                clínico: densidad natural, sin signos visibles del tratamiento,
                respetando la armonía facial.
              </p>
              <div className="doctor-info-grid">
                {[
                  { label: 'ROL',          value: 'Director médico' },
                  { label: 'ESPECIALIDAD', value: 'Medicina Capilar' },
                  { label: 'EQUIPO',       value: 'Cirujanos certificados' },
                  { label: 'ACREDITACIÓN', value: 'Colegio Médico' },
                ].map((item) => (
                  <div className="doctor-info-cell" key={item.label}>
                    <div className="doctor-info-label">{item.label}</div>
                    <div className="doctor-info-value">{item.value}</div>
                  </div>
                ))}
              </div>
              <blockquote className="doctor-quote">
                <p>"Mi compromiso es darte un resultado que vos reconozcas como tuyo — no como un trabajo bien hecho, sino como tu cabello, recuperado."</p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────── */}
      <section className="vir-section cta-banner-bg">
        <div className="container">
          <div className="cta-banner-inner">
            <p className="section-eyebrow">Sin compromiso</p>
            <h2 className="section-title">
              Descubrí tu candidatura<br />en{' '}
              <span className="section-title-gold">dos minutos.</span>
            </h2>
            <p className="section-sub" style={{ margin: '0 auto 36px', textAlign: 'center' }}>
              Respondé 5 preguntas rápidas, subí una foto de tu cabello y recibí un
              diagnóstico preliminar con Vir IA al instante.
            </p>
            <button className="btn-gold" onClick={openQuiz}>
              Iniciar diagnóstico gratuito →
            </button>
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ───────────────────────── */}
      <section className="vir-section" id="resultados">
        <div className="container">
          <div className="results-header">
            <div>
              <p className="section-eyebrow">Transformaciones reales</p>
              <h2 className="section-title">
                Resultados naturales.<br />
                Transformaciones<br />
                <span className="section-title-gold">reales.</span>
              </h2>
            </div>
            <p className="section-sub" style={{ maxWidth: 380, alignSelf: 'center' }}>
              Deslizá el control en cada caso para comparar. Cada resultado mostrado está
              documentado con la misma luz, distancia y ángulo — sin trucos de peinado,
              sin retoques.
            </p>
          </div>
          <div className="sliders-grid">
            <BeforeAfterSlider label="Entradas"  beforeImg="/entradas-despues.jpg"  afterImg="/entradas-antes.jpg" />
            <BeforeAfterSlider label="Coronilla" beforeImg="/coronilla-despues.jpg" afterImg="/coronilla-antes.jpg" />
            <BeforeAfterSlider label="Densidad"  beforeImg="/densidad-despues.png"  afterImg="/densidad-antes.png" />
          </div>
        </div>
      </section>

      {/* ── JOURNEY / STEPS ──────────────────────── */}
      <section className="vir-section journey-bg" id="proceso">
        <div className="container">
          <div className="results-header">
            <div>
              <p className="section-eyebrow">EL PROCESO</p>
              <h2 className="section-title">
                Cinco pasos,<br />
                <span className="section-title-gold">un</span> resultado.
              </h2>
            </div>
            <p className="section-sub" style={{ maxWidth: 380, alignSelf: 'center' }}>
              Un marco completo construido alrededor de tu tiempo, tu comodidad
              y la precisión que tu resultado merece.
            </p>
          </div>
          <div className="steps-grid">
            {[
              { n: '— 01', title: 'Consulta',       desc: 'Evaluación personalizada, mapeo de densidad y alineación de objetivos con el equipo médico.',            time: '60 MIN',       img: '/step-consulta.png' },
              { n: '— 02', title: 'Diseño de línea', desc: 'Arquitectura a medida basada en tus proporciones faciales, edad y crecimiento natural.',                  time: '45 MIN',       img: '/step-diseno.jpeg' },
              { n: '— 03', title: 'Procedimiento',   desc: 'Protocolo indoloro con sedación — extracción e implante FUE / DHI.',                                       time: '6 – 8 HR',     img: '/step-procedimiento.jpeg' },
              { n: '— 04', title: 'Seguimiento',     desc: 'Acompañamiento clínico con controles, protocolo en casa y línea directa con el equipo médico.',            time: '1 – 12 MESES', img: '/step-seguimiento.jpeg' },
              { n: '— 05', title: 'Resultado final', desc: 'La densidad florece gradualmente — evaluación final a los 12 meses.',                                      time: '12 MESES',     img: '/step-resultado.jpeg' },
            ].map((s) => (
              <div className="step-card" key={s.n}>
                <div className="step-dot" />
                <img src={s.img} alt={s.title} className="step-photo" />
                <div className="step-body">
                  <div className="step-number">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <span className="step-time">{s.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <section className="vir-section" id="testimonios">
        <div className="container">
          <p className="section-eyebrow">Pacientes reales</p>
          <h2 className="section-title">
            Pacientes que <span className="section-title-gold">eligieron</span> VIR.
          </h2>
          <div className="testimonials-grid">
            {[
              { name: 'Ricardo V.', detail: 'Trasplante FUE · 2023', text: 'Antes era insoportable con las fotos, no había ángulo en el que saliera bien. Gracias a los médicos de VIR me reconcilié con la cámara.', avatar: 'https://i.pravatar.cc/150?img=52' },
{ name: 'Diego M.', detail: 'Tratamiento capilar · 2024', text: 'Usaba gorras todo el tiempo, de día, de noche, adentro, afuera. Ya era parte de mí. Hoy no la necesito, la uso cuando quiero.', avatar: 'https://i.pravatar.cc/150?img=68' },
{ name: 'Nicolás F.', detail: 'Trasplante FUE · 2024', text: 'Empecé a evitar la peluquería porque cada vez que me cortaban el pelo yo veía menos. Era una vez al mes recordándome lo mismo.', avatar: 'https://i.pravatar.cc/150?img=45' },
{ name: 'Andrés G.', detail: 'Trasplante FUE · 2023', text: 'La gente me sumaba años en comparación con mis amigos de mi misma edad. El implante fue como viajar 10 años en el tiempo. Más feliz no puedo estar.', avatar: 'https://i.pravatar.cc/150?img=77' },            ].map((t) => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <img src={t.avatar} alt={t.name} className="testimonial-avatar-photo" />
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

      {/* ── FAQ ──────────────────────────────────── */}
      <section className="vir-section faq-bg" id="faq">
        <div className="container">
          <p className="section-eyebrow">Preguntas frecuentes</p>
          <h2 className="section-title">
            Todo lo que querías <span className="section-title-gold">preguntar.</span>
          </h2>
          <div className="faq-grid">
            <div className="faq-list">
              {FAQS.map((item, i) => (
                <div className={`faq-item${openFaq === i ? ' faq-item-open' : ''}`} key={i}>
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
                Nuestro equipo responde todas tus preguntas por WhatsApp. Sin turnos,
                sin formularios, sin esperas.
              </p>
              <a className="btn-gold" href={WA_URL_GENERAL} target="_blank" rel="noreferrer">
                💬 Escribir por WhatsApp
              </a>
              <button className="btn-ghost" onClick={openQuiz}>
                Hacer el diagnóstico →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGO DIVIDER ─────────────────────────── */}
      <div className="section-logo-divider" aria-hidden="true">
        <img src="/logo-icon.jpeg" alt="" />
      </div>

      {/* ── FINAL CTA ────────────────────────────── */}
      <section className="vir-section final-cta">
        <div className="container">
          <p className="section-eyebrow">Comienza tu camino</p>
          <h2 className="section-title final-cta-title">
            El mejor momento para<br />
            <span className="section-title-gold">recuperar tu cabello</span><br />
            es ahora.
          </h2>
          <p className="section-sub final-cta-desc">
            Un diagnóstico presencial es la vía más precisa para definir el procedimiento
            ideal para tu caso. Reserva una cita privada con nuestro equipo médico.
          </p>
          <div className="final-cta-actions">
            <button className="btn-gold" onClick={openQuiz}>
              Agendar diagnóstico personalizado →
            </button>
            <a className="btn-dark" href={WA_URL_GENERAL} target="_blank" rel="noreferrer">
              Hablar por WhatsApp →
            </a>
          </div>
          <p className="final-cta-footer">— CONFIDENCIAL · SIN COSTO · SIN COMPROMISO</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="site-footer">
        <div className="nav-logo-group">
          <img src="/logo-icon.jpeg" alt="VIR" width="28" height="32" style={{ filter: 'invert(1)', objectFit: 'contain' }} />
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Vir Medicina Capilar · Todos los derechos reservados</p>
        <a className="nav-cta-pill" href={WA_URL_GENERAL} target="_blank" rel="noreferrer">Contacto</a>
      </footer>

      {/* ── FLOATING WA ──────────────────────────── */}
      <a className="wa-float" href={WA_URL_GENERAL} target="_blank" rel="noreferrer" title="WhatsApp">💬</a>

      {/* ── QUIZ OVERLAY ─────────────────────────── */}
      {quizOpen && (
        <div className="quiz-overlay">
          <div className="quiz-overlay-header">
            <div className="nav-logo-group">
              <img src="/logo-icon.jpeg" alt="VIR" width="28" height="32" style={{ filter: 'invert(1)', objectFit: 'contain' }} />
            </div>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="quiz-step-label">
              {step < RESULT_STEP ? `${step + 1} / ${TOTAL}` : 'Resultado'}
            </span>
            <button className="quiz-close" onClick={closeQuiz}>✕</button>
          </div>

          <div className="quiz-body">

            {/* ── Paso 1–5: preguntas de opción múltiple ── */}
            {step < QUIZ_STEPS.length && (
              <div className="quiz-card" key={step}>
                <div className="quiz-step-indicator">
                  <span className="quiz-step-indicator-left">
                    DIAGNÓSTICO · PASO <span>{String(step + 1).padStart(2, '0')}</span>
                  </span>
                  <div className="quiz-step-indicator-line" />
                  <span className="quiz-step-indicator-right">
                    <span>{String(step + 1).padStart(2, '0')}</span> / {String(QUIZ_STEPS.length).padStart(2, '0')}
                  </span>
                </div>
                <h2 className="quiz-question">{QUIZ_STEPS[step].question}</h2>
                <div className="quiz-options">
                  {QUIZ_STEPS[step].options.map((opt, i) => (
                    <button
                      key={opt}
                      className={`quiz-option${answers[QUIZ_STEPS[step].id] === opt ? ' quiz-option-selected' : ''}`}
                      onClick={() => pickOption(QUIZ_STEPS[step].id, opt)}
                    >
                      <span className="quiz-option-letter">{String(i + 1).padStart(2, '0')}</span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      <span className="quiz-option-radio" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Paso 6: carga de foto ── */}
            {step === PHOTO_STEP && (
              <div className="quiz-card" key="photo">
                <h2 className="quiz-question">Subí una foto de tu cabello</h2>
                <p style={{ color: 'var(--gray-light)', marginBottom: 24, fontSize: '0.95rem' }}>
                  Tomá fotos de la coronilla, línea frontal o zona de mayor preocupación.
                  Tu imagen es privada y solo se usa para el diagnóstico.
                </p>
                <label className="quiz-photo-drop">
                  <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} />
                  <div className="quiz-photo-icon">📷</div>
                  <h3>
                    {files.length > 0
                      ? `${files.length} foto${files.length > 1 ? 's' : ''} seleccionada${files.length > 1 ? 's' : ''}`
                      : 'Tocá para seleccionar fotos'}
                  </h3>
                  <p>Hasta 3 imágenes · JPG, PNG o WebP (máx. 5 MB)</p>
                </label>
                {previews.length > 0 && (
                  <div className="quiz-photos-preview">
                    {previews.map((url, i) => (
                      <img key={i} src={url} alt={`Foto ${i + 1}`} className="quiz-photo-thumb" />
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                  <button className="btn-gold" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(FORM_STEP)}>
                    {files.length > 0 ? 'Continuar al formulario →' : 'Continuar sin foto →'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Paso 7: formulario ── */}
            {step === FORM_STEP && phase !== 'loading' && (
              <div className="quiz-card" key="form">
                <div className="quiz-form-premium-card">
                  <h2 className="quiz-question" style={{ marginBottom: 10 }}>Completá tus datos</h2>
                  <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 32, fontSize: '0.9rem' }}>
                    El médico especialista revisará tu caso y te contactará en las próximas 24 hs hábiles.
                  </p>
                  <form className="quiz-form" onSubmit={handleSubmit}>
                    <input type="hidden" name="bot" value={form.bot} />
                    <div className="form-field">
                      <label>Nombre completo *</label>
                      <input className="form-input form-input-line" type="text" placeholder="Tu nombre" value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} required />
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Edad *</label>
                        <input className="form-input form-input-line" type="number" placeholder="35" min="18" max="99" value={form.edad} onChange={(e) => setField('edad', e.target.value)} required />
                      </div>
                      <div className="form-field">
                        <label>WhatsApp *</label>
                        <input className="form-input form-input-line" type="tel" placeholder="+54 9 11..." value={form.whatsapp} onChange={(e) => setField('whatsapp', e.target.value)} required />
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Email <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(opcional)</span></label>
                      <input className="form-input form-input-line" type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                    </div>
                    <div className="form-field">
                      <label>Descripción de tu caso</label>
                      <textarea className="form-input form-input-line" rows={3} placeholder="Contanos sobre tu situación capilar, antigüedad de la pérdida, antecedentes familiares..." value={form.comentarios} onChange={(e) => setField('comentarios', e.target.value)} style={{ resize: 'vertical' }} />
                    </div>
                    <label className="consent-row">
                      <input type="checkbox" checked={form.human} onChange={(e) => setField('human', e.target.checked)} required />
                      <span>Confirmo que soy humano y acepto recibir mi evaluación diagnóstica.</span>
                    </label>
                    {apiError && <div className="error-msg">{apiError}</div>}
                    <button type="submit" className="btn-gold" disabled={!canSubmit} style={{ justifyContent: 'center' }}>
                      Enviar mi caso →
                    </button>
                    <a className="btn-whatsapp" href={WA_URL_GENERAL} target="_blank" rel="noreferrer">
                      💬 Escribir directo por WhatsApp
                    </a>
                  </form>
                </div>
              </div>
            )}

            {/* ── Paso 7 cargando ── */}
            {step === FORM_STEP && phase === 'loading' && (
              <div className="quiz-card" key="loading">
                <div className="quiz-loading">
                  <div className="quiz-loading-spinner" />
                  <p>Procesando imágenes capilares...</p>
                  <p style={{ fontSize: '0.82rem', opacity: 0.5 }}>Esto puede tardar unos segundos</p>
                </div>
              </div>
            )}

            {/* ── Paso 8: caso recibido ── */}
            {step === RESULT_STEP && (
              <div className="quiz-card" key="result">
                <div className="quiz-result-premium-card">

                  <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div className="quiz-result-badge">✓ Caso recibido</div>
                    <h2 className="quiz-result-title" style={{ marginTop: 20, marginBottom: 16 }}>
                      ¡Caso recibido!
                    </h2>
                    <p className="quiz-result-sub">
                      Nuestros especialistas analizarán tu densidad y escala para contactarte a la brevedad.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
                    <a
                      className="btn-gold"
                      href={WA_URL_TEST}
                      target="_blank"
                      rel="noreferrer"
                      style={{ justifyContent: 'center' }}
                    >
                      💬 Hablar con un especialista por WhatsApp
                    </a>
                    <button className="btn-ghost" onClick={closeQuiz} style={{ justifyContent: 'center' }}>
                      Volver a la web
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
