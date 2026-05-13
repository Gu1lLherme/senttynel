import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Marker do usuário — círculo 14px, primary #1743B8, borda branca 2.5px
const userIcon = L.divIcon({
  className: 'sentinel-user-marker',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#1743B8;border:2.5px solid #FFFFFF;box-shadow:0 2px 6px rgba(23,67,184,0.45);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const alertIcon = L.divIcon({
  className: 'sentinel-alert-marker',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#A81825;border:3px solid white;box-shadow:0 2px 8px rgba(168,24,37,0.5);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">!</div>`,
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
  userAccuracyRadius = 80, // raio da cerca tracejada ao redor do usuário, em metros
  zones = [],
  alerts = [],
  height = '100%',
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
          <>
            {/* Cerca tracejada ao redor do usuário */}
            <Circle
              center={userPosition}
              radius={userAccuracyRadius}
              pathOptions={{
                color: '#1743B8',
                weight: 1.5,
                fillColor: '#1743B8',
                fillOpacity: 0.07,
                dashArray: '5 4',
              }}
            />
            <Marker position={userPosition} icon={userIcon}>
              <Popup>Você está aqui</Popup>
            </Marker>
          </>
        )}

        {zones.filter(z => z.lat && z.lng).map(zone => {
          const isDanger = zone.zone_type === 'danger';
          const color = !zone.is_active ? '#8A9FC0' : (isDanger ? '#A81825' : '#155230');
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