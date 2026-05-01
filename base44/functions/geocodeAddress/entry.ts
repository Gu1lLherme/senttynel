import { createClientFromRequest } from 'npm:@base44/sdk@0.8.27';

// Free geocoding using Nominatim (OpenStreetMap)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { address } = await req.json();
    if (!address) return Response.json({ error: 'address required' }, { status: 400 });

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SENTINEL-App/1.0' },
    });
    if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
    const results = await res.json();

    if (!results.length) {
      return Response.json({ found: false });
    }
    const r = results[0];
    return Response.json({
      found: true,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      display_name: r.display_name,
    });
  } catch (error) {
    console.error('geocodeAddress error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});