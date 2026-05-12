import { useState } from 'react';

function LeadForm({ disabled, onSubmit, submitted }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (disabled) return;
    onSubmit();
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div>
        <h3>Formulario de contacto</h3>
        <p>Guarda el lead y activa la atención médica a través de WhatsApp.</p>
      </div>
      <div className="input-group">
        <label htmlFor="name">Nombre completo</label>
        <input
          id="name"
          type="text"
          placeholder="Nombre del paciente"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label htmlFor="phone">Teléfono o WhatsApp</label>
        <input
          id="phone"
          type="tel"
          placeholder="+34 600 123 456"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
      </div>
      <div className="input-group">
        <label htmlFor="message">Comentarios</label>
        <textarea
          id="message"
          placeholder="Breve descripción del caso"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
      <button className="primary-button" type="submit" disabled={disabled}>
        Enviar solicitud
      </button>
      <a
        className="whatsapp-button"
        href={`https://wa.me/34123456789?text=${encodeURIComponent(
          `Hola Vir Medicina Capilar, quiero una consulta sobre mi caso capilar. Nombre: ${name}. Email: ${email}. Teléfono: ${phone}.`,
        )}`}
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp directo
      </a>
      {submitted && (
        <div className="status-message">
          <span>✔</span> Lead enviado correctamente. El equipo recibirá la notificación.
        </div>
      )}
    </form>
  );
}

export default LeadForm;
