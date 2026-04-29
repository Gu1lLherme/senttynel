import { createClientFromRequest } from 'npm:@base44/sdk@0.8.27';

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

    const typeLabels = {
      queda: 'Queda Detectada',
      panico: 'Botão de Pânico',
      imobilidade: 'Imobilidade',
      manual: 'SOS Manual',
    };

    let sent = 0;
    for (const link of links) {
      const subject = `🚨 SENTINEL — Alerta de ${child_name || user.full_name}`;
      const body = `
Olá,

${child_name || user.full_name} acionou um alerta no SENTINEL.

🔔 Tipo: ${typeLabels[alert_type] || alert_type}
⚠️ Severidade: ${severity}
📍 Localização: ${location_address || 'Não disponível'}
🕐 Horário: ${new Date().toLocaleString('pt-BR')}
${notes ? `\n📝 Observações: ${notes}` : ''}

Acesse o app para ver detalhes em tempo real.

— Equipe SENTINEL
      `.trim();

      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'SENTINEL Alertas',
        to: link.parent_email,
        subject,
        body,
      });
      sent++;
    }

    return Response.json({ sent, total_links: links.length });
  } catch (error) {
    console.error('sendChildAlert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});