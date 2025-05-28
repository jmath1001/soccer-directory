'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const isValidLatLng = (pos) =>
  Array.isArray(pos) &&
  pos.length === 2 &&
  typeof pos[0] === 'number' &&
  !isNaN(pos[0]) &&
  typeof pos[1] === 'number' &&
  !isNaN(pos[1]);

const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
};

const FlyToLocation = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (isValidLatLng(position)) {
      map.flyTo(position, 15, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
};

const MapView = ({ fields, selectedPosition }) => {
  const router = useRouter();

  const validFields = fields.filter(
    (f) =>
      typeof f.latitude === 'number' &&
      !isNaN(f.latitude) &&
      typeof f.longitude === 'number' &&
      !isNaN(f.longitude)
  );

  const defaultCenter = [32.7767, -96.7970];

  const centerPosition = isValidLatLng(selectedPosition)
    ? selectedPosition
    : validFields.length > 0
    ? [validFields[0].latitude, validFields[0].longitude]
    : defaultCenter;

  return (
    <MapContainer
      center={centerPosition}
      zoom={11}
      scrollWheelZoom
      className="h-full w-full rounded-lg shadow"
    >
      <ResizeMap />
      {isValidLatLng(selectedPosition) && (
        <FlyToLocation position={selectedPosition} />
      )}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {validFields.map((field) => (
        <Marker
          key={field.id}
          position={[field.latitude, field.longitude]}
          icon={defaultIcon}
        >
          <Popup>
            <strong>{field.facilityName}</strong>
            <br />
            {field.location}
            <br />
            <button
              className="text-blue-600 underline mt-1"
              onClick={() => router.push(`/field/${field.id}`)}
            >
              View Details
            </button>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
