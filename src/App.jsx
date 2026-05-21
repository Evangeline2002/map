import React, { useState, useEffect, useMemo } from 'react';
import MapComponent from './components/MapComponent';
import BookingModal from './components/BookingModal';
import FilterPanel from './components/FilterPanel';
import AdminPanel from './components/AdminPanel';
import ConfigCheck from './components/ConfigCheck';
import CoordinateMapper from './components/CoordinateMapper';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase';
import initialData from './data/tamilNaduSportsData.json';
import { getCategoryColor, TN_DISTRICTS } from './data/constants';
import './App.css';

// Haversine formula to compute distance in km between two coordinates
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function App() {
  const [locations, setLocations] = useState(initialData);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(300); // Default to 300km radius
  const [selectedType, setSelectedType] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [bookingLocation, setBookingLocation] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // Tabs for Sidebar
  const [activeTab, setActiveTab] = useState('venues'); // 'venues' or 'coordinates'

  // Custom Pinned Locations State (Persisted in LocalStorage)
  const [pinnedLocations, setPinnedLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('pinned_locations');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('pinned_locations', JSON.stringify(pinnedLocations));
  }, [pinnedLocations]);

  useEffect(() => {
    const q = query(collection(db, 'locations'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const locs = [];
      querySnapshot.forEach((doc) => {
        locs.push({ id: doc.id, ...doc.data() });
      });
      if (locs.length === 0) {
        setLocations(initialData);
      } else {
        setLocations(locs);
      }
    }, (error) => {
      console.warn('Firestore subscription failed, falling back to local data:', error);
      setLocations(initialData);
    });
    return () => unsubscribe();
  }, []);

  const sportTypes = useMemo(() => 
    [...new Set(locations.map(loc => loc.type))].filter(Boolean).sort(), 
  [locations]);

  const selectedDistrictCenter = useMemo(() => {
    if (!selectedDistrict || selectedDistrict === 'All') return null;
    const districtLocs = locations.filter(
      loc => loc.district?.toLowerCase().trim() === selectedDistrict.toLowerCase().trim()
    );
    if (districtLocs.length === 0) return null;
    const sumLat = districtLocs.reduce((sum, loc) => sum + loc.lat, 0);
    const sumLng = districtLocs.reduce((sum, loc) => sum + loc.lng, 0);
    return {
      lat: sumLat / districtLocs.length,
      lng: sumLng / districtLocs.length
    };
  }, [locations, selectedDistrict]);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      let matchesDistrict = true;
      if (selectedDistrict && selectedDistrict !== 'All') {
        if (selectedRadius > 0 && selectedDistrictCenter) {
          const dist = getHaversineDistance(
            loc.lat,
            loc.lng,
            selectedDistrictCenter.lat,
            selectedDistrictCenter.lng
          );
          matchesDistrict = dist <= selectedRadius;
        } else {
          matchesDistrict = loc.district?.toLowerCase().trim() === selectedDistrict.toLowerCase().trim();
        }
      }
      
      const matchesType = !selectedType || selectedType === 'All' || 
        loc.type?.toLowerCase().trim() === selectedType.toLowerCase().trim() ||
        (selectedType !== 'Others' && loc.name?.toLowerCase().includes(selectedType.toLowerCase().trim()));
      return matchesDistrict && matchesType;
    });
  }, [locations, selectedDistrict, selectedType, selectedRadius, selectedDistrictCenter]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => console.warn('Geolocation not available.')
      );
    }
  }, []);

  const [selectedLocation, setSelectedLocation] = useState(null);

  // State to hold coordinates clicked on the map
  const [clickedCoords, setClickedCoords] = useState(null);

  const handleMapClick = (coords) => {
    if (activeTab === 'coordinates') {
      setClickedCoords(coords);
    }
  };

  // Custom Coordinate handlers
  const handleAddPin = (newPin) => {
    setPinnedLocations(prev => [newPin, ...prev]);
    setSelectedLocation(newPin);
  };

  const handleRemovePin = (id) => {
    setPinnedLocations(prev => prev.filter(p => p.id !== id));
    if (selectedLocation?.id === id) {
      setSelectedLocation(null);
    }
  };

  const handleClearPins = () => {
    setPinnedLocations([]);
    if (selectedLocation?.type === 'custom_pin') {
      setSelectedLocation(null);
    }
  };

  return (
    <div className="app">
      <div className="map-side">
        <MapComponent 
          locations={filteredLocations} 
          userLocation={userLocation} 
          onBookClick={setBookingLocation} 
          selectedDistrict={selectedDistrict || 'All'}
          selectedLocation={selectedLocation}
          pinnedLocations={pinnedLocations}
          onRemovePin={handleRemovePin}
          onMapClick={handleMapClick}
        />
      </div>

      <div className="sidebar-side">
        <div className="sidebar-header">
          <div className="header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2>TN Sports Hub</h2>
            <button 
              className="admin-toggle" 
              onClick={() => setShowAdmin(!showAdmin)}
              title="Admin Panel"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background 0.2s'
              }}
            >
              {showAdmin ? '✕' : '⚙️'}
            </button>
          </div>

          {!showAdmin && (
            <div className="sidebar-tabs" style={{ display: 'flex', gap: '8px', marginTop: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '2px' }}>
              <button 
                className={`tab-btn ${activeTab === 'venues' ? 'active' : ''}`}
                onClick={() => { setActiveTab('venues'); setSelectedLocation(null); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  background: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: activeTab === 'venues' ? '#1a73e8' : '#5f6368',
                  borderBottom: activeTab === 'venues' ? '3px solid #1a73e8' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                🏢 Venues
              </button>
              <button 
                className={`tab-btn ${activeTab === 'coordinates' ? 'active' : ''}`}
                onClick={() => { setActiveTab('coordinates'); setSelectedLocation(null); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  border: 'none',
                  background: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  color: activeTab === 'coordinates' ? '#1a73e8' : '#5f6368',
                  borderBottom: activeTab === 'coordinates' ? '3px solid #1a73e8' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                📍 Map Coordinates
              </button>
            </div>
          )}
        </div>

        <div className="sidebar-content">
          {showAdmin ? (
            <AdminPanel 
              onLocationAdded={() => {}} 
              adminLatLng={null} 
              onComplete={() => setShowAdmin(false)} 
            />
          ) : activeTab === 'coordinates' ? (
            <CoordinateMapper
              pinnedLocations={pinnedLocations}
              onAddPin={handleAddPin}
              onRemovePin={handleRemovePin}
              onClearPins={handleClearPins}
              onSelectPin={setSelectedLocation}
              selectedPin={selectedLocation}
              clickedCoords={clickedCoords}
            />
          ) : (
            <>
              <div style={{ padding: '0 24px' }}>
                <FilterPanel 
                  districts={TN_DISTRICTS}
                  selectedDistrict={selectedDistrict}
                  selectedType={selectedType}
                  onDistrictChange={(d) => { setSelectedDistrict(d); setSelectedLocation(null); }}
                  onTypeChange={(t) => { setSelectedType(t); setSelectedLocation(null); }}
                  selectedRadius={selectedRadius}
                  onRadiusChange={setSelectedRadius}
                />
                <div className="stats" style={{ margin: '8px 0 16px 0', padding: '12px', background: '#e8f0fe', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', color: '#1a73e8', border: '1px solid rgba(26,115,232,0.2)' }}>
                  {filteredLocations.length} Venues Found
                </div>
              </div>
              
              <div className="location-list">
                {filteredLocations.length > 0 ? (
                  filteredLocations.map(loc => (
                    <div 
                      key={loc.id} 
                      className={`location-card ${selectedLocation?.id === loc.id ? 'selected' : ''}`}
                      onClick={() => setSelectedLocation(loc)}
                    >
                      <span className="category-badge" style={{ background: getCategoryColor(loc.type) }}>
                        {loc.type}
                      </span>
                      <h3>{loc.name}</h3>
                      <p>📍 {loc.address}</p>
                      <p>📞 {loc.phone}</p>
                      <div className="actions">
                        <a href={`tel:${loc.phone}`} className="btn-call" onClick={(e) => e.stopPropagation()}>Call</a>
                        <button className="btn-view" onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLocation(loc);
                        }}>View on Map</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{padding: '40px', textAlign: 'center', color: '#666'}}>
                    No venues found for the selected filters.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {bookingLocation && (
        <BookingModal
          location={bookingLocation}
          onClose={() => setBookingLocation(null)}
          onBook={(loc, slot) => alert(`Booked ${loc.name} at ${slot}`)}
        />
      )}

      <ConfigCheck />
    </div>
  );
}

export default App;