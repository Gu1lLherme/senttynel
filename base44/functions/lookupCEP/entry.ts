import { createClientFromRequest } from 'npm:@base44/sdk@0.8.27';

// Consulta de CEP usando ViaCEP (gratuito, sem autenticação)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { cep } = await req.json();
    if (!cep) return Response.json({ error: 'cep required' }, { status: 400 });

    const cleanCep = String(cep).replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      return Response.json({ found: false, error: 'CEP deve ter 8 dígitos' });
    }

    // ViaCEP
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!res.ok) throw new Error(`ViaCEP failed: ${res.status}`);
    const data = await res.json();

    if (data.erro) {
      return Response.json({ found: false, error: 'CEP não encontrado' });
    }

    const fullAddress = [data.logradouro, data.bairro, data.localidade, data.uf]
      .filter(Boolean)
      .join(', ');

    // Tentar geocodificar para obter lat/lng
    let coords = { lat: null, lng: null };
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(fullAddress + ', Brasil')}`;
      const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'SENTINEL-App/1.0' } });
      if (geoRes.ok) {
        const results = await geoRes.json();
        if (results.length > 0) {
          coords = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
        }
      }
    } catch (e) {
      console.warn('Geocoding from CEP failed:', e);
    }

    return Response.json({
      found: true,
      cep: cleanCep,
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      uf: data.uf || '',
      address: fullAddress,
      ...coords,
    });
  } catch (error) {
    console.error('lookupCEP error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});