// Inicia uma solicitação para encontrar/localizar/tocar o dispositivo do alvo.
// Cria um FindDeviceRequest e dispara push notification para o alvo.
//
// Payload: { target_email, action: 'ring'|'locate'|'lock', message? }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { target_email, action, message } = await req.json();
    if (!target_email || !action) {
      return Response.json({ error: 'target_email e action obrigatórios' }, { status: 400 });
    }

    // Verifica vínculo (parceiro/responsável) — segurança
    const links = await base44.asServiceRole.entities.ParentalLink.filter({
      parent_email: user.email,
      child_email: target_email,
      status: 'ativo',
    });
    if (links.length === 0) {
      return Response.json({ error: 'Você não tem vínculo ativo com este usuário' }, { status: 403 });
    }

    const request = await base44.asServiceRole.entities.FindDeviceRequest.create({
      requester_email: user.email,
      target_email,
      action,
      status: 'pendente',
      message: message || '',
    });

    // Dispara push para o alvo
    const titles = {
      ring: '🔔 Localizando seu dispositivo',
      locate: '📍 Solicitação de localização',
      lock: '🔒 Solicitação de bloqueio',
    };
    const bodies = {
      ring: `${user.full_name || 'Um familiar'} está procurando seu celular. Toque para responder.`,
      locate: `${user.full_name || 'Um familiar'} solicitou sua localização atual.`,
      lock: `${user.full_name || 'Um familiar'} pediu para bloquear este dispositivo.`,
    };

    try {
      await base44.asServiceRole.functions.invoke('sendPushNotification', {
        target_email,
        title: titles[action],
        body: message || bodies[action],
        severity: 'alto',
        url: '/app',
        tag: `find-device-${request.id}`,
      });
    } catch (e) {
      console.warn('Push notification failed:', e.message);
    }

    return Response.json({ success: true, request_id: request.id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});