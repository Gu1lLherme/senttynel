import { createClientFromRequest } from 'npm:@base44/sdk@0.8.27';
import { jsPDF } from 'npm:jspdf@4.0.0';

// ─── Helpers de layout ──────────────────────────────────────────────
const COLORS = {
  primary: [29, 78, 216],     // blue-700
  primaryLight: [219, 234, 254], // blue-100
  accent: [220, 38, 38],      // red-600
  text: [15, 23, 42],         // slate-900
  textMuted: [100, 116, 139], // slate-500
  border: [226, 232, 240],    // slate-200
  bg: [248, 250, 252],        // slate-50
  success: [22, 163, 74],     // green-600
  warning: [217, 119, 6],     // amber-600
};

const PAGE = { w: 210, h: 297, margin: 15 };
const SEVERITY_PT = { critico: 'Crítico', alto: 'Alto', medio: 'Médio', baixo: 'Baixo' };
const TYPE_PT = { queda: 'Queda', panico: 'Pânico', imobilidade: 'Imobilidade', rota_desviada: 'Rota desviada', manual: 'SOS Manual' };
const STATUS_PT = { ativo: 'Ativo', resolvido: 'Resolvido', falso_positivo: 'Falso positivo' };

function setColor(doc, fn, [r, g, b]) { doc[fn](r, g, b); }
function fmtDate(d) { return new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); }

function drawHeader(doc, title, subtitle) {
  // Banner azul
  setColor(doc, 'setFillColor', COLORS.primary);
  doc.rect(0, 0, PAGE.w, 38, 'F');
  // Faixa accent
  setColor(doc, 'setFillColor', COLORS.accent);
  doc.rect(0, 38, PAGE.w, 2, 'F');
  // Logo / texto
  setColor(doc, 'setTextColor', [255, 255, 255]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('SENTINEL', PAGE.margin, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Proteção Inteligente', PAGE.margin, 24);
  // Título à direita
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(title, PAGE.w - PAGE.margin, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(subtitle, PAGE.w - PAGE.margin, 24, { align: 'right' });
}

function drawFooter(doc, pageNum, total) {
  setColor(doc, 'setDrawColor', COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(PAGE.margin, 283, PAGE.w - PAGE.margin, 283);
  setColor(doc, 'setTextColor', COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('SENTINEL — Confidencial', PAGE.margin, 289);
  doc.text(`Página ${pageNum} de ${total}`, PAGE.w - PAGE.margin, 289, { align: 'right' });
}

function sectionTitle(doc, y, label, accent = COLORS.primary) {
  setColor(doc, 'setFillColor', accent);
  doc.rect(PAGE.margin, y - 4, 3, 6, 'F');
  setColor(doc, 'setTextColor', COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(label, PAGE.margin + 6, y);
  return y + 8;
}

function statCard(doc, x, y, w, h, label, value, color = COLORS.primary) {
  setColor(doc, 'setFillColor', COLORS.bg);
  setColor(doc, 'setDrawColor', COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 2, 2, 'FD');
  setColor(doc, 'setTextColor', COLORS.textMuted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(label.toUpperCase(), x + 4, y + 6);
  setColor(doc, 'setTextColor', color);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(String(value), x + 4, y + 16);
}

function severityBadge(doc, x, y, severity) {
  const colorMap = { critico: COLORS.accent, alto: COLORS.warning, medio: COLORS.primary, baixo: COLORS.textMuted };
  const c = colorMap[severity] || COLORS.textMuted;
  const label = SEVERITY_PT[severity] || severity;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  const w = doc.getTextWidth(label) + 4;
  setColor(doc, 'setFillColor', c);
  doc.roundedRect(x, y - 3, w, 4.5, 1, 1, 'F');
  setColor(doc, 'setTextColor', [255, 255, 255]);
  doc.text(label, x + 2, y);
}

function ensureSpace(doc, y, needed = 30) {
  if (y + needed > 275) { doc.addPage(); return 50; }
  return y;
}

// ─── Endpoint ───────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { child_email, year, month } = await req.json();
    const targetEmail = child_email || user.email;

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);
    const monthName = start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    // Fetch data
    const alerts = await base44.asServiceRole.entities.Alert.filter({ created_by: targetEmail });
    const monthAlerts = alerts.filter(a => { const d = new Date(a.created_date); return d >= start && d <= end; });

    let pings = [];
    try { pings = await base44.asServiceRole.entities.LocationPing.filter({ user_email: targetEmail }); } catch {}
    const monthPings = pings.filter(p => { const d = new Date(p.created_date); return d >= start && d <= end; });

    let geoEvents = [];
    try { geoEvents = await base44.asServiceRole.entities.GeofenceEvent.filter({ child_email: targetEmail }); } catch {}
    const monthGeo = geoEvents.filter(e => { const d = new Date(e.created_date); return d >= start && d <= end; });

    // Métricas
    const battery = monthPings.map(p => p.battery_level).filter(b => typeof b === 'number');
    const avgBattery = battery.length ? Math.round(battery.reduce((s, n) => s + n, 0) / battery.length) : null;
    const minBattery = battery.length ? Math.min(...battery) : null;
    const criticalAlerts = monthAlerts.filter(a => a.severity === 'critico').length;
    const resolvedAlerts = monthAlerts.filter(a => a.status === 'resolvido').length;
    const responseRate = monthAlerts.length ? Math.round((resolvedAlerts / monthAlerts.length) * 100) : 100;

    // Build PDF
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    drawHeader(doc, 'Relatório Mensal', monthName);

    let y = 50;

    // Bloco identificação
    setColor(doc, 'setFillColor', COLORS.primaryLight);
    doc.roundedRect(PAGE.margin, y, PAGE.w - PAGE.margin * 2, 16, 2, 2, 'F');
    setColor(doc, 'setTextColor', COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(targetEmail, PAGE.margin + 4, y + 7);
    setColor(doc, 'setTextColor', COLORS.textMuted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Gerado em ${fmtDate(new Date())}`, PAGE.margin + 4, y + 12);
    y += 22;

    // Stats grid
    y = sectionTitle(doc, y, 'Resumo executivo');
    const cardW = (PAGE.w - PAGE.margin * 2 - 9) / 4;
    statCard(doc, PAGE.margin, y, cardW, 22, 'Alertas', monthAlerts.length, COLORS.primary);
    statCard(doc, PAGE.margin + cardW + 3, y, cardW, 22, 'Críticos', criticalAlerts, COLORS.accent);
    statCard(doc, PAGE.margin + (cardW + 3) * 2, y, cardW, 22, 'Resolução', `${responseRate}%`, COLORS.success);
    statCard(doc, PAGE.margin + (cardW + 3) * 3, y, cardW, 22, 'Bat. média', avgBattery !== null ? `${avgBattery}%` : '—', COLORS.warning);
    y += 28;

    // Métricas extra
    statCard(doc, PAGE.margin, y, cardW, 22, 'GPS pings', monthPings.length, COLORS.primary);
    statCard(doc, PAGE.margin + cardW + 3, y, cardW, 22, 'Cercas', monthGeo.length, COLORS.primary);
    statCard(doc, PAGE.margin + (cardW + 3) * 2, y, cardW, 22, 'Bat. mínima', minBattery !== null ? `${minBattery}%` : '—', COLORS.warning);
    statCard(doc, PAGE.margin + (cardW + 3) * 3, y, cardW, 22, 'Falsos +', monthAlerts.filter(a => a.status === 'falso_positivo').length, COLORS.textMuted);
    y += 30;

    // Alertas
    if (monthAlerts.length > 0) {
      y = ensureSpace(doc, y, 30);
      y = sectionTitle(doc, y, `Alertas detalhados (${monthAlerts.length})`, COLORS.accent);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      monthAlerts.slice(0, 30).forEach((a, i) => {
        y = ensureSpace(doc, y, 14);
        if (i % 2 === 0) {
          setColor(doc, 'setFillColor', COLORS.bg);
          doc.rect(PAGE.margin, y - 4, PAGE.w - PAGE.margin * 2, 11, 'F');
        }
        setColor(doc, 'setTextColor', COLORS.text);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(TYPE_PT[a.type] || a.type, PAGE.margin + 2, y);
        severityBadge(doc, PAGE.margin + 35, y, a.severity);
        doc.setFont('helvetica', 'normal');
        setColor(doc, 'setTextColor', COLORS.textMuted);
        doc.setFontSize(8);
        doc.text(fmtDate(a.created_date), PAGE.margin + 60, y);
        doc.text(STATUS_PT[a.status] || a.status, PAGE.w - PAGE.margin - 2, y, { align: 'right' });
        if (a.location_address) {
          doc.setFontSize(7);
          doc.text(a.location_address.substring(0, 95), PAGE.margin + 2, y + 4);
        }
        y += 11;
      });
      y += 4;
    }

    // Cercas
    if (monthGeo.length > 0) {
      y = ensureSpace(doc, y, 30);
      y = sectionTitle(doc, y, `Eventos de cerca geográfica (${monthGeo.length})`, COLORS.success);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      monthGeo.slice(0, 25).forEach((e, i) => {
        y = ensureSpace(doc, y, 8);
        if (i % 2 === 0) {
          setColor(doc, 'setFillColor', COLORS.bg);
          doc.rect(PAGE.margin, y - 4, PAGE.w - PAGE.margin * 2, 7, 'F');
        }
        const action = e.event_type === 'enter' ? '→ Chegou em' : '← Saiu de';
        setColor(doc, 'setTextColor', COLORS.text);
        doc.setFont('helvetica', 'bold');
        doc.text(action, PAGE.margin + 2, y);
        doc.setFont('helvetica', 'normal');
        doc.text(e.zone_name || '—', PAGE.margin + 32, y);
        setColor(doc, 'setTextColor', COLORS.textMuted);
        doc.setFontSize(8);
        doc.text(fmtDate(e.created_date), PAGE.w - PAGE.margin - 2, y, { align: 'right' });
        doc.setFontSize(9);
        y += 7;
      });
      y += 4;
    }

    // Atividade GPS
    if (monthPings.length > 0) {
      y = ensureSpace(doc, y, 30);
      y = sectionTitle(doc, y, 'Atividade GPS');
      setColor(doc, 'setTextColor', COLORS.text);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const first = monthPings[monthPings.length - 1];
      const last = monthPings[0];
      const lines = [
        `Total de pings registrados: ${monthPings.length}`,
        first ? `Primeira leitura: ${fmtDate(first.created_date)}` : null,
        last ? `Última leitura: ${fmtDate(last.created_date)}` : null,
      ].filter(Boolean);
      lines.forEach(l => { doc.text(`•  ${l}`, PAGE.margin + 2, y); y += 5.5; });
    }

    // Sem dados
    if (monthAlerts.length === 0 && monthGeo.length === 0 && monthPings.length === 0) {
      y = sectionTitle(doc, y, 'Sem atividade neste período');
      setColor(doc, 'setTextColor', COLORS.textMuted);
      doc.setFontSize(10);
      doc.text('Nenhum dado foi registrado no mês selecionado.', PAGE.margin + 2, y);
    }

    // Footer em todas as páginas
    const total = doc.internal.pages.length - 1;
    for (let i = 1; i <= total; i++) { doc.setPage(i); drawFooter(doc, i, total); }

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