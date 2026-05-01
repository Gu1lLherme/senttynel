import { createClientFromRequest } from 'npm:@base44/sdk@0.8.27';

function buildMimeMessage({ to, subject, body }) {
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
  return btoa(unescape(encodeURIComponent(lines.join('\r\n'))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sendGmail(accessToken, to, subject, body) {
  const raw = buildMimeMessage({ to, subject, body });
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) throw new Error(`Gmail: ${res.status} ${await res.text()}`);
  return res.json();
}

// Haversine: distance in meters between two coordinates
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { lat, lng, battery_level } = await req.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return Response.json({ error: 'lat/lng required' }, { status: 400 });
    }

    // Save the location ping
    await base44.entities.LocationPing.create({
      user_email: user.email,
      lat, lng,
      battery_level: battery_level ?? null,
    });

    // Fetch active zones
    const zones = await base44.asServiceRole.entities.SafeZone.filter({ is_active: true });
    if (!zones.length) return Response.json({ events: [] });

    // Fetch previous ping to detect transitions
    const recent = await base44.asServiceRole.entities.LocationPing.filter(
      { user_email: user.email }, '-created_date', 2
    );
    const prev = recent.length > 1 ? recent[1] : null;

    // Fetch parental links to know who to notify
    const parentalLinks = await base44.asServiceRole.entities.ParentalLink.filter({
      child_email: user.email, status: 'ativo',
    });

    const childName = parentalLinks[0]?.child_name || user.full_name || user.email;
    const events = [];

    for (const zone of zones) {
      if (!zone.lat || !zone.lng) continue;
      const radius = zone.radius_meters || 200;
      const isInside = distanceMeters(lat, lng, zone.lat, zone.lng) <= radius;
      const wasInside = prev
        ? distanceMeters(prev.lat, prev.lng, zone.lat, zone.lng) <= radius
        : isInside;

      let eventType = null;
      if (!wasInside && isInside && zone.notify_on_enter !== false) eventType = 'enter';
      else if (wasInside && !isInside && zone.notify_on_exit !== false) eventType = 'exit';
      if (!eventType) continue;

      const event = await base44.entities.GeofenceEvent.create({
        child_email: user.email,
        child_name: childName,
        zone_id: zone.id,
        zone_name: zone.name,
        event_type: eventType,
        lat, lng,
      });
      events.push(event);

      // Notify parents via Gmail
      if (parentalLinks.length) {
        try {
          const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');
          const action = eventType === 'enter' ? 'CHEGOU em' : 'SAIU de';
          const subject = `📍 SENTINEL — ${childName} ${action} ${zone.name}`;
          const body = `Olá,

${childName} ${eventType === 'enter' ? 'chegou em' : 'saiu de'} ${zone.name}.

🕐 Horário: ${new Date().toLocaleString('pt-BR')}
📍 Local: ${zone.address}
🗺️ Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}

Acompanhe em tempo real pelo app SENTINEL.`;

          for (const link of parentalLinks) {
            if (link.email_notifications === false) continue;
            try {
              await sendGmail(accessToken, link.parent_email, subject, body);
              await base44.asServiceRole.entities.GeofenceEvent.update(event.id, { notified: true });
            } catch (err) {
              console.error('Gmail error:', err.message);
            }
          }
        } catch (err) {
          console.error('Gmail connection error:', err.message);
        }
      }
    }

    return Response.json({ events });
  } catch (error) {
    console.error('checkGeofence error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});