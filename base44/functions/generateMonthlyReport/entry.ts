import { createClientFromRequest } from 'npm:@base44/sdk@0.8.27';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { child_email, year, month } = await req.json();
    // month is 0-11
    const targetEmail = child_email || user.email;

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    // Fetch alerts
    const alerts = await base44.asServiceRole.entities.Alert.filter({ created_by: targetEmail });
    const monthAlerts = alerts.filter(a => {
      const d = new Date(a.created_date);
      return d >= start && d <= end;
    });

    // Fetch location pings for battery + routes
    let pings = [];
    try {
      pings = await base44.asServiceRole.entities.LocationPing.filter({ user_email: targetEmail });
    } catch (e) {
      pings = [];
    }
    const monthPings = pings.filter(p => {
      const d = new Date(p.created_date);
      return d >= start && d <= end;
    });

    // Geofence events
    let geoEvents = [];
    try {
      geoEvents = await base44.asServiceRole.entities.GeofenceEvent.filter({ child_email: targetEmail });
    } catch (e) {
      geoEvents = [];
    }
    const monthGeo = geoEvents.filter(e => {
      const d = new Date(e.created_date);
      return d >= start && d <= end;
    });

    // Compute metrics
    const batteryLevels = monthPings.map(p => p.battery_level).filter(b => typeof b === 'number');
    const avgBattery = batteryLevels.length
      ? Math.round(batteryLevels.reduce((s, n) => s + n, 0) / batteryLevels.length)
      : null;

    const monthName = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Build PDF
    const doc = new jsPDF();
    let y = 20;

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('SENTINEL', 14, 15);
    doc.setFontSize(11);
    doc.text('Relatório Mensal de Atividades', 14, 23);

    doc.setTextColor(30, 41, 59);
    y = 42;
    doc.setFontSize(14);
    doc.text(`Período: ${monthName}`, 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Usuário: ${targetEmail}`, 14, y);
    y += 5;
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, y);
    y += 12;

    // Summary
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.text('Resumo', 14, y);
    y += 7;
    doc.setFontSize(10);
    const summary = [
      `• Total de alertas: ${monthAlerts.length}`,
      `• Alertas críticos: ${monthAlerts.filter(a => a.severity === 'critico').length}`,
      `• Alertas resolvidos: ${monthAlerts.filter(a => a.status === 'resolvido').length}`,
      `• Bateria média: ${avgBattery !== null ? avgBattery + '%' : 'Sem dados'}`,
      `• Pontos de localização registrados: ${monthPings.length}`,
      `• Eventos de cerca geográfica: ${monthGeo.length}`,
    ];
    summary.forEach(line => {
      doc.text(line, 18, y);
      y += 6;
    });

    y += 6;

    // Alerts list
    if (monthAlerts.length > 0) {
      doc.setFontSize(13);
      doc.text('Alertas Detalhados', 14, y);
      y += 7;
      doc.setFontSize(9);

      monthAlerts.slice(0, 25).forEach(a => {
        if (y > 270) { doc.addPage(); y = 20; }
        const date = new Date(a.created_date).toLocaleString('pt-BR');
        doc.setTextColor(30, 41, 59);
        doc.text(`${date} — ${a.type} (${a.severity})`, 18, y);
        y += 5;
        if (a.location_address) {
          doc.setTextColor(100, 116, 139);
          doc.text(`   📍 ${a.location_address.substring(0, 80)}`, 18, y);
          y += 5;
        }
      });
      y += 4;
    }

    // Geofence events
    if (monthGeo.length > 0) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.text('Cercas Geográficas', 14, y);
      y += 7;
      doc.setFontSize(9);
      monthGeo.slice(0, 20).forEach(e => {
        if (y > 270) { doc.addPage(); y = 20; }
        const date = new Date(e.created_date).toLocaleString('pt-BR');
        const action = e.event_type === 'enter' ? 'Entrou em' : 'Saiu de';
        doc.text(`${date} — ${action} ${e.zone_name}`, 18, y);
        y += 5;
      });
      y += 4;
    }

    // Routes
    if (monthPings.length > 0) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.text('Resumo de Rotas', 14, y);
      y += 7;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`${monthPings.length} pontos GPS registrados ao longo do mês.`, 18, y);
      y += 5;
      const firstP = monthPings[monthPings.length - 1];
      const lastP = monthPings[0];
      if (firstP) {
        doc.text(`Primeira leitura: ${new Date(firstP.created_date).toLocaleString('pt-BR')}`, 18, y);
        y += 5;
      }
      if (lastP) {
        doc.text(`Última leitura: ${new Date(lastP.created_date).toLocaleString('pt-BR')}`, 18, y);
        y += 5;
      }
    }

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('SENTINEL — Proteção Inteligente', 14, 290);
      doc.text(`Página ${i} de ${pageCount}`, 180, 290);
    }

    const pdfBytes = doc.output('arraybuffer');
    const filename = `sentinel-relatorio-${year}-${String(month + 1).padStart(2, '0')}.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('generateMonthlyReport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});