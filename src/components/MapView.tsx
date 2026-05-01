'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';
import type { RentalField } from '@/types';

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
});

const isValidLatLng = (pos: [number, number] | null | undefined): pos is [number, number] =>
  Array.isArray(pos) &&
  pos.length === 2 &&
  typeof pos[0] === 'number' &&
  !isNaN(pos[0]) &&
  typeof pos[1] === 'number' &&
  !isNaN(pos[1]);

const ResizeMap: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

const FlyToLocation: React.FC<{ position: [number, number] | null }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (isValidLatLng(position)) {
      map.flyTo(position, 15, { duration: 1.5 });
    }
  }, [position, map]);
  return null;
};

interface MapViewProps {
  fields: RentalField[];
  selectedPosition: [number, number] | null;
}

const MapView: React.FC<MapViewProps> = ({ fields, selectedPosition }) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const validFields = fields.filter(
    (f) => typeof f.latitude === 'number' && !isNaN(f.latitude) && typeof f.longitude === 'number' && !isNaN(f.longitude)
  );

  const defaultCenter: [number, number] = [32.7767, -96.797];

  const centerPosition: [number, number] = isValidLatLng(selectedPosition)
    ? selectedPosition
    : validFields.length > 0
    ? [validFields[0].latitude!, validFields[0].longitude!]
    : defaultCenter;

  return (
    <MapContainer center={centerPosition} zoom={11} scrollWheelZoom className="h-full w-full rounded-lg shadow">
      <ResizeMap />
      {!isMobile && <FlyToLocation position={selectedPosition} />}

      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {validFields.map((field) => (
        <Marker
          key={field.id}
          position={[field.latitude!, field.longitude!]}
          icon={defaultIcon}
          eventHandlers={{ click: () => router.push(`/field/${field.id}`) }}
        >
          <Popup>
            <strong>{field.facility_name}</strong>
            <br />
            {field.location}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
