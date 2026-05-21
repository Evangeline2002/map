import React, { useState, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TAMIL_NADU_CENTER, DEFAULT_ZOOM, TAMIL_NADU_BOUNDS, getCategoryColor } from '../data/constants';

// Leaflet Icon Fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const containerStyle = { width: '100%', height: '100%' };

// Helper component to update Leaflet view
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// MapEvents component for Leaflet click handling
function MapEvents({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
}

function MapComponent({ 
  locations, 
  userLocation, 
  onBookClick, 
  selectedDistrict, 
  selectedLocation, 
  pinnedLocations = [], 
  onRemovePin,
  onMapClick
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isGoogleKeyValid = apiKey && apiKey.startsWith('AIza') && !apiKey.includes('REPLACE');

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: isGoogleKeyValid ? apiKey : ""
  });

  const [selectedMarker, setSelectedMarker] = useState(null);
  const useGoogle = isGoogleKeyValid && isLoaded && !loadError;

  // Auto-select marker when selectedLocation changes (from Sidebar)
  useEffect(() => {
    if (selectedLocation) {
      setSelectedMarker(selectedLocation);
    }
  }, [selectedLocation]);

  const center = useMemo(() => {
    if (selectedLocation) {
      return { lat: selectedLocation.lat, lng: selectedLocation.lng };
    }
    if (selectedDistrict !== 'All' && locations.length > 0) {
      const districtLoc = locations.find(l => l.district === selectedDistrict);
      if (districtLoc) return { lat: districtLoc.lat, lng: districtLoc.lng };
    }
    return TAMIL_NADU_CENTER;
  }, [selectedDistrict, locations, selectedLocation]);

  const zoom = selectedLocation ? 15 : (selectedDistrict === 'All' ? DEFAULT_ZOOM : 10);

  // Check if center is outside Tamil Nadu bounds
  const isOutsideBounds = useMemo(() => {
    if (!center) return false;
    return center.lat < 8.0 || center.lat > 13.5 || center.lng < 76.0 || center.lng > 80.5;
  }, [center]);

  // Dynamically set google map options
  const googleMapOptions = useMemo(() => {
    return {
      minZoom: 2,
      styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
    };
  }, []);

  if (useGoogle) {
    return (
      <div style={containerStyle}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
          options={googleMapOptions}
          onClick={(e) => onMapClick && onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
        >
          <MarkerClusterer>
            {(clusterer) =>
              locations.map((loc) => (
                <MarkerF
                  key={loc.id}
                  position={{ lat: loc.lat, lng: loc.lng }}
                  clusterer={clusterer}
                  onClick={() => setSelectedMarker(loc)}
                  icon={{
                    path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                    fillColor: getCategoryColor(loc.type),
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#ffffff",
                    scale: loc.type?.toLowerCase().includes('academy') ? 3.8 : 2.8,
                    anchor: new window.google.maps.Point(12, 22)
                  }}
                />
              ))
            }
          </MarkerClusterer>

          {/* Render custom pins in Google Maps */}
          {pinnedLocations.map((pin) => (
            <MarkerF
              key={pin.id}
              position={{ lat: pin.lat, lng: pin.lng }}
              onClick={() => setSelectedMarker(pin)}
              icon={{
                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                fillColor: pin.color || "#ff1744",
                fillOpacity: 1,
                strokeWeight: 2.5,
                strokeColor: "#ffffff",
                scale: 3.5,
                anchor: new window.google.maps.Point(12, 22)
              }}
            />
          ))}

          {selectedMarker && (
            <InfoWindow 
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }} 
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="info-window">
                <h3 style={{margin: '0 0 5px 0'}}>{selectedMarker.name}</h3>
                {selectedMarker.type === 'custom_pin' ? (
                  <>
                    <p style={{margin: '4px 0'}}><strong>Latitude:</strong> {selectedMarker.lat.toFixed(6)}</p>
                    <p style={{margin: '4px 0'}}><strong>Longitude:</strong> {selectedMarker.lng.toFixed(6)}</p>
                    <button 
                      onClick={() => {
                        onRemovePin(selectedMarker.id);
                        setSelectedMarker(null);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 0',
                        marginTop: '10px',
                        background: '#ff1744',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    >
                      Remove Pin
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{margin: '2px 0'}}><strong>Category:</strong> {selectedMarker.type}</p>
                    <p style={{margin: '2px 0'}}><strong>Phone:</strong> {selectedMarker.phone}</p>
                    <a href={`tel:${selectedMarker.phone}`} style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 0',
                      marginTop: '10px',
                      background: '#34a853',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      textDecoration: 'none'
                    }}>Call Now</a>
                  </>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    );
  }

  // Fallback to Leaflet (No Error Mode)
  return (
    <div style={containerStyle}>
      <MapContainer 
        center={[11.1271, 78.6569]} 
        zoom={7} 
        style={containerStyle}
        minZoom={2}
      >
        <ChangeView center={[center.lat, center.lng]} zoom={zoom} />
        <MapEvents onMapClick={onMapClick} />
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MarkerClusterGroup>
          {locations.map((loc) => (
            <Marker 
              key={loc.id} 
              position={[loc.lat, loc.lng]}
              icon={L.divIcon({
                className: 'custom-div-icon',
                html: `<svg width="${loc.type?.toLowerCase().includes('academy') ? 60 : 50}" height="${loc.type?.toLowerCase().includes('academy') ? 84 : 70}" viewBox="0 0 24 24" fill="${getCategoryColor(loc.type)}" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke="white" stroke-width="1.5"/>
                       </svg>`,
                iconSize: loc.type?.toLowerCase().includes('academy') ? [60, 84] : [50, 70],
                iconAnchor: loc.type?.toLowerCase().includes('academy') ? [30, 84] : [25, 70],
                popupAnchor: [0, -75]
              })}
              eventHandlers={{
                click: () => setSelectedMarker(loc)
              }}
            />
          ))}
        </MarkerClusterGroup>

        {/* Render custom pins in Leaflet map */}
        {pinnedLocations.map((pin) => (
          <Marker 
            key={pin.id} 
            position={[pin.lat, pin.lng]}
            icon={L.divIcon({
              className: 'custom-pinned-icon-wrapper',
              html: `<div class="pulse-ring" style="border-color: ${pin.color}"></div>
                     <svg width="40" height="40" viewBox="0 0 24 24" fill="${pin.color}" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke="white" stroke-width="2"/>
                     </svg>`,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40]
            })}
            eventHandlers={{
              click: () => setSelectedMarker(pin)
            }}
          />
        ))}

        {selectedMarker && !useGoogle && (
          <Popup position={[selectedMarker.lat, selectedMarker.lng]} onClose={() => setSelectedMarker(null)}>
            <div className="info-window" style={{ minWidth: '220px' }}>
              <h3 style={{margin: '0 0 5px 0', fontSize: '1rem', color: selectedMarker.type === 'custom_pin' ? selectedMarker.color : '#202124'}}>
                {selectedMarker.type === 'custom_pin' ? '📍' : ''} {selectedMarker.name}
              </h3>
              {selectedMarker.type === 'custom_pin' ? (
                <>
                  <p style={{margin: '4px 0', fontSize: '0.8rem'}}><strong>Latitude:</strong> {selectedMarker.lat.toFixed(6)}</p>
                  <p style={{margin: '4px 0', fontSize: '0.8rem'}}><strong>Longitude:</strong> {selectedMarker.lng.toFixed(6)}</p>
                  <button 
                    onClick={() => {
                      onRemovePin(selectedMarker.id);
                      setSelectedMarker(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 0',
                      marginTop: '10px',
                      background: '#ff1744',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }}
                  >
                    Remove Pin
                  </button>
                </>
              ) : (
                <>
                  <p style={{margin: '2px 0', fontSize: '0.8rem'}}><strong>Category:</strong> {selectedMarker.type}</p>
                  <p style={{margin: '2px 0', fontSize: '0.8rem'}}>{selectedMarker.address}</p>
                  <a href={`tel:${selectedMarker.phone}`} style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 0',
                    marginTop: '10px',
                    background: '#34a853',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textDecoration: 'none'
                  }}>Call Now</a>
                </>
              )}
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}

export default React.memo(MapComponent);