// Envia notificações push aos dispositivos inscritos de um usuário.
// Usa Web Push Protocol via npm:web-push.
// Requer secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (ex: "mailto:contato@sentinel.app")
//
// Payload esperado:
// { target_email: string, title: string, body: string, severity?, url?, tag? }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { target_email, title, body, severity, url, tag } = await req.json();
    if (!target_email || !title) {
      return Response.json({ error: 'target_email e title são obrigatórios' }, { status: 400 });
    }

    const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY');
    const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY');
    const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:contato@sentinel.app';

    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      return Response.json({ error: 'VAPID keys não configuradas' }, { status: 500 });
    }

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

    // Buscar inscrições ativas do alvo
    const subs = await base44.asServiceRole.entities.PushSubscription.filter({
      user_email: target_email,
      is_active: true,
    });

    if (subs.length === 0) {
      return Response.json({ sent: 0, message: 'Sem inscrições push para este usuário' });
    }

    const payload = JSON.stringify({
      title, body: body || '', severity: severity || 'medio',
      url: url || '/app', tag: tag || 'sentinel',
    });

    let sent = 0, failed = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        }, payload);
        sent++;
      } catch (err) {
        failed++;
        // 410 = inscrição expirada → desativar
        if (err.statusCode === 410 || err.statusCode === 404) {
          await base44.asServiceRole.entities.PushSubscription.update(sub.id, { is_active: false });
        }
      }
    }

    return Response.json({ sent, failed, total: subs.length });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});