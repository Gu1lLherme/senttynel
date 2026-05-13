import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Leaflet (Vite doesn't bundle them by default)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const userIcon = L.divIcon({
  className: 'sentinel-user-marker',
  html: `<div style="position:relative;width:28px;height:28px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.3);animation:pulse 2s infinite;"></div>
    <div style="position:absolute;inset:6px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const alertIcon = L.divIcon({
  className: 'sentinel-alert-marker',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#dc2626;border:3px solid white;box-shadow:0 2px 8px rgba(220,38,38,0.5);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">!</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function LiveMap({
  center = [-23.5505, -46.6333],
  zoom = 14,
  userPosition,
  zones = [],
  alerts = [],
  height = '100%',
  onMapClick,
}) {
  const mapRef = useRef(null);
  const mapCenter = userPosition || center;

  return (
    <div style={{ height, width: '100%', position: 'relative', borderRadius: '0.75rem', overflow: 'hidden' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <RecenterMap center={mapCenter} />

        {userPosition && (
          <Marker position={userPosition} icon={userIcon}>
            <Popup>Você está aqui</Popup>
          </Marker>
        )}

        {zones.filter(z => z.lat && z.lng).map(zone => {
          const isDanger = zone.zone_type === 'danger';
          const color = !zone.is_active ? '#9ca3af' : (isDanger ? '#dc2626' : '#10b981');
          return (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.radius_meters || 200}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: isDanger ? 0.22 : 0.15,
              weight: 2,
              dashArray: isDanger ? '6, 4' : undefined,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{zone.name}</p>
                <p className="text-xs text-gray-500">{zone.address}</p>
                <p className="text-xs mt-1">Raio: {zone.radius_meters}m</p>
              </div>
            </Popup>
          </Circle>
          );
        })}

        {alerts.filter(a => a.location_lat && a.location_lng).map(alert => (
          <Marker key={alert.id} position={[alert.location_lat, alert.location_lng]} icon={alertIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold capitalize">{alert.type}</p>
                <p className="text-xs">{alert.location_address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}