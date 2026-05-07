import React, { useState, useEffect, useMemo } from 'react';
import MapComponent from './components/MapComponent';
import BookingModal from './components/BookingModal';
import FilterPanel from './components/FilterPanel';
import AdminPanel from './components/AdminPanel';
import ConfigCheck from './components/ConfigCheck';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from './firebase';
import initialData from './data/tamilNaduSportsData.json';
import { getCategoryColor, TN_DISTRICTS } from './data/constants';
import './App.css';

function App() {
  const [locations, setLocations] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [bookingLocation, setBookingLocation] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

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
    });
    return () => unsubscribe();
  }, []);

  const sportTypes = useMemo(() => 
    [...new Set(locations.map(loc => loc.type))].filter(Boolean).sort(), 
  [locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesDistrict = !selectedDistrict || selectedDistrict === 'All' || 
        loc.district?.toLowerCase().trim() === selectedDistrict.toLowerCase().trim();
      const matchesType = !selectedType || selectedType === 'All' || 
        loc.type?.toLowerCase().trim() === selectedType.toLowerCase().trim() ||
        (selectedType !== 'Others' && loc.name?.toLowerCase().includes(selectedType.toLowerCase().trim()));
      return matchesDistrict && matchesType;
    });
  }, [locations, selectedDistrict, selectedType]);

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

  // ... (keep useEffects same)

  return (
    <div className="app">
      <div className="map-side">
        <MapComponent 
          locations={filteredLocations} 
          userLocation={userLocation} 
          onBookClick={setBookingLocation} 
          selectedDistrict={selectedDistrict || 'All'}
          selectedLocation={selectedLocation}
        />
      </div>

      <div className="sidebar-side">
        <div className="sidebar-header">
          <div className="header-row">
            <h2>TN Sports Hub</h2>
            <button 
              className="admin-toggle" 
              onClick={() => setShowAdmin(!showAdmin)}
              title="Admin Panel"
            >
              {showAdmin ? '✕' : '⚙️'}
            </button>
          </div>
        </div>

        <div className="sidebar-content">
          {showAdmin ? (
            <AdminPanel 
              onLocationAdded={() => {}} 
              adminLatLng={null} 
              onComplete={() => setShowAdmin(false)} 
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
                />
                <div className="stats" style={{ margin: '16px 0', padding: '12px', background: '#e8f0fe', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', color: '#1a73e8', border: '1px solid rgba(26,115,232,0.2)' }}>
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