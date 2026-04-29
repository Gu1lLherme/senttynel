import { createClientFromRequest } from 'npm:@base44/sdk@0.8.27';

function buildMimeMessage({ to, subject, body }) {
  // Encode subject in RFC 2047 (UTF-8 base64) to handle emojis and accents
  const encodedSubject = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const lines = [
    `To: ${to}`,
    `Subject: ${encodedSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 7bit',
    '',
    body,
  ];
  const message = lines.join('\r\n');
  // Base64URL encode
  return btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function sendGmail(accessToken, to, subject, body) {
  const raw = buildMimeMessage({ to, subject, body });
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gmail API error: ${res.status} ${errText}`);
  }
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { alert_type, severity, location_address, child_name, notes } = await req.json();

    // Find all parental links for this child
    const links = await base44.asServiceRole.entities.ParentalLink.filter({
      child_email: user.email,
      status: 'ativo',
      email_notifications: true,
    });

    if (!links.length) {
      return Response.json({ sent: 0, message: 'Nenhum responsável vinculado' });
    }

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const typeLabels = {
      queda: 'Queda Detectada',
      panico: 'Botão de Pânico',
      imobilidade: 'Imobilidade',
      manual: 'SOS Manual',
    };

    const subject = `🚨 SENTINEL — Alerta de ${child_name || user.full_name}`;
    const body = `Olá,

${child_name || user.full_name} acionou um alerta no SENTINEL.

🔔 Tipo: ${typeLabels[alert_type] || alert_type}
⚠️ Severidade: ${severity}
📍 Localização: ${location_address || 'Não disponível'}
🕐 Horário: ${new Date().toLocaleString('pt-BR')}
${notes ? `\n📝 Observações: ${notes}` : ''}

Acesse o app para ver detalhes em tempo real.

— Equipe SENTINEL`;

    let sent = 0;
    const errors = [];
    for (const link of links) {
      try {
        await sendGmail(accessToken, link.parent_email, subject, body);
        sent++;
      } catch (err) {
        console.error(`Failed to send to ${link.parent_email}:`, err.message);
        errors.push({ email: link.parent_email, error: err.message });
      }
    }

    return Response.json({ sent, total_links: links.length, errors });
  } catch (error) {
    console.error('sendChildAlert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});