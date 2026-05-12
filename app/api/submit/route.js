import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const LEADS_FILE = path.join(process.cwd(), 'leads_vir.json');

function appendLead(lead) {
  try {
    let leads = [];
    if (fs.existsSync(LEADS_FILE)) {
      leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    }
    leads.push(lead);
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
  } catch (err) {
    console.error('[VIR] Error guardando lead:', err.message);
  }
}

async function sendLeadEmail(fields, files) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('[VIR] EMAIL_USER o EMAIL_PASS no configurados — omitiendo envío de email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: emailUser, pass: emailPass },
  });

  const attachments = await Promise.all(
    files.map(async (file, i) => ({
      filename: file.name || `foto-${i + 1}.jpg`,
      content: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    }))
  );

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:580px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <p style="font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#C4983A;margin:0 0 8px;">VIR · MEDICINA CAPILAR</p>
      <h1 style="font-size:24px;font-weight:300;color:#fff;margin:0;">Nueva consulta recibida</h1>
    </div>
    <div style="background:#0a0a0a;border:0.5px solid #D4AF37;border-radius:16px;padding:32px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#C4983A;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;width:140px;">Nombre</td>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#fff;font-size:15px;">${fields.nombre}</td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#C4983A;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Teléfono</td>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#fff;font-size:15px;">${fields.whatsapp}</td>
        </tr>
        ${fields.edad ? `<tr>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#C4983A;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Edad</td>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#fff;font-size:15px;">${fields.edad} años</td>
        </tr>` : ''}
        ${fields.email ? `<tr>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#C4983A;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Email</td>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#fff;font-size:15px;">${fields.email}</td>
        </tr>` : ''}
        ${fields.comentarios ? `<tr>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#C4983A;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Comentarios</td>
          <td style="padding:12px 0;border-bottom:1px solid #222;color:#fff;font-size:15px;">${fields.comentarios}</td>
        </tr>` : ''}
      </table>

      ${(fields.answer_concern || fields.answer_duration || fields.answer_confidence || fields.answer_previous || fields.answer_goal) ? `
      <div style="margin-top:28px;">
        <p style="color:#C4983A;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin:0 0 12px;">Cuestionario</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          ${fields.answer_concern    ? `<tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:11px;width:200px;">¿Qué te preocupa más?</td><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#fff;font-size:14px;">${fields.answer_concern}</td></tr>` : ''}
          ${fields.answer_duration   ? `<tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:11px;">¿Hace cuánto notás la caída?</td><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#fff;font-size:14px;">${fields.answer_duration}</td></tr>` : ''}
          ${fields.answer_confidence ? `<tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:11px;">¿Cómo afecta tu confianza?</td><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#fff;font-size:14px;">${fields.answer_confidence}</td></tr>` : ''}
          ${fields.answer_previous   ? `<tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#888;font-size:11px;">¿Tratamientos anteriores?</td><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#fff;font-size:14px;">${fields.answer_previous}</td></tr>` : ''}
          ${fields.answer_goal       ? `<tr><td style="padding:10px 0;color:#888;font-size:11px;">¿Qué resultado buscás?</td><td style="padding:10px 0;color:#fff;font-size:14px;">${fields.answer_goal}</td></tr>` : ''}
        </table>
      </div>` : ''}

      ${files.length > 0 ? `<p style="color:#666;font-size:12px;margin:24px 0 0;text-align:center;">
        Foto${files.length !== 1 ? 's' : ''} adjunta${files.length !== 1 ? 's' : ''}: ${files.length} imagen${files.length !== 1 ? 'es' : ''}
      </p>` : ''}
    </div>
    <p style="text-align:center;color:#333;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin-top:32px;">
      VIR MEDICINA CAPILAR · CONSULTA AUTOMÁTICA
    </p>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"VIR Medicina Capilar" <${emailUser}>`,
    to: 'virmedicinacapilar@gmail.com',
    subject: 'NUEVA CONSULTA - Vir Medicina Capilar',
    html,
    attachments,
  });
}

async function parseFormData(request) {
  const formData = await request.formData();
  const fields = {
    nombre:             formData.get('nombre')?.toString()             || '',
    whatsapp:           formData.get('whatsapp')?.toString()           || '',
    email:              formData.get('email')?.toString()              || '',
    edad:               formData.get('edad')?.toString()               || '',
    comentarios:        formData.get('comentarios')?.toString()        || '',
    bot:                formData.get('bot')?.toString()                || '',
    answer_concern:     formData.get('answer_concern')?.toString()     || '',
    answer_duration:    formData.get('answer_duration')?.toString()    || '',
    answer_confidence:  formData.get('answer_confidence')?.toString()  || '',
    answer_previous:    formData.get('answer_previous')?.toString()    || '',
    answer_goal:        formData.get('answer_goal')?.toString()        || '',
  };
  const files = formData.getAll('images').filter(
    (item) => item && typeof item === 'object' && typeof item.arrayBuffer === 'function'
  );
  return { fields, files };
}

export async function POST(request) {
  try {
    const { fields, files } = await parseFormData(request);

    if (fields.bot) {
      return new Response(JSON.stringify({ error: 'Spam detectado.' }), { status: 400 });
    }

    if (!fields.nombre || !fields.whatsapp || !fields.edad) {
      return new Response(JSON.stringify({ error: 'Nombre, WhatsApp y edad son obligatorios.' }), { status: 400 });
    }

    await sendLeadEmail(fields, files).catch((err) =>
      console.error('[VIR] Error enviando email:', err.message)
    );

    appendLead({
      fecha:              new Date().toISOString(),
      nombre:             fields.nombre,
      edad:               fields.edad,
      whatsapp:           fields.whatsapp,
      email:              fields.email              || null,
      comentarios:        fields.comentarios        || null,
      fotos:              files.length,
      answer_concern:     fields.answer_concern     || null,
      answer_duration:    fields.answer_duration    || null,
      answer_confidence:  fields.answer_confidence  || null,
      answer_previous:    fields.answer_previous    || null,
      answer_goal:        fields.answer_goal        || null,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    );
  } catch (error) {
    console.error('[VIR] Error en submit:', error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
