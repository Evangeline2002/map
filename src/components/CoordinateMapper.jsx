import React, { useState, useEffect } from 'react';

const COLOR_PRESETS = [
  { name: 'Red', value: '#ff1744' },
  { name: 'Blue', value: '#2979ff' },
  { name: 'Green', value: '#00e676' },
  { name: 'Gold', value: '#ffc400' },
  { name: 'Purple', value: '#d500f9' },
  { name: 'Orange', value: '#ff9100' }
];

function CoordinateMapper({ pinnedLocations, onAddPin, onRemovePin, onClearPins, onSelectPin, selectedPin, clickedCoords }) {
  const [quickPaste, setQuickPaste] = useState('');
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [selectedColor, setSelectedColor] = useState('#ff1744');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-fill form when map is clicked
  useEffect(() => {
    if (clickedCoords) {
      setLatInput(clickedCoords.lat.toString());
      setLngInput(clickedCoords.lng.toString());
      setQuickPaste(`${clickedCoords.lat.toFixed(6)}, ${clickedCoords.lng.toFixed(6)}`);
      setErrorMsg('');
    }
  }, [clickedCoords]);

  // Handle getting user's current device location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatInput(lat.toString());
          setLngInput(lng.toString());
          setQuickPaste(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setErrorMsg('');
        },
        () => setErrorMsg('Geolocation access denied or unavailable.')
      );
    } else {
      setErrorMsg('Geolocation is not supported by your browser.');
    }
  };

  // Robust parsing of pasted coordinate strings
  const handleQuickPasteChange = (e) => {
    const val = e.target.value;
    setQuickPaste(val);
    setErrorMsg('');

    if (!val.trim()) return;

    const numRegex = /[-+]?[0-9]*\.?[0-9]+/g;
    const matches = val.match(numRegex);

    if (matches && matches.length >= 2) {
      let lat = parseFloat(matches[0]);
      let lng = parseFloat(matches[1]);

      const upperText = val.toUpperCase();
      const lngIndex = val.indexOf(matches[1]);

      const firstPart = upperText.substring(0, lngIndex);
      const secondPart = upperText.substring(lngIndex);

      if (firstPart.includes('S')) lat = -Math.abs(lat);
      if (secondPart.includes('W')) lng = -Math.abs(lng);

      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        setLatInput(lat.toString());
        setLngInput(lng.toString());
        setErrorMsg('');
      } else {
        setErrorMsg('Coordinates extracted are out of range (Lat: -90 to 90, Lng: -180 to 180)');
      }
    } else {
      setErrorMsg('Could not detect latitude and longitude. Try typing them below.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setErrorMsg('Invalid latitude. Must be between -90 and 90.');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setErrorMsg('Invalid longitude. Must be between -180 and 180.');
      return;
    }

    const newPin = {
      id: Date.now().toString(),
      name: nameInput.trim() || `Pinned Point (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      lat,
      lng,
      color: selectedColor,
      address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      type: 'custom_pin'
    };

    onAddPin(newPin);
    
    setQuickPaste('');
    setLatInput('');
    setLngInput('');
    setNameInput('');
  };

  const copyToClipboard = (pin) => {
    const text = `${pin.lat.toFixed(6)}, ${pin.lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    alert(`Copied coordinates to clipboard: ${text}`);
  };

  return (
    <div className="coordinate-mapper">
      <div className="mapper-section">
        <h3 className="mapper-title">
          <span>📍</span> Map Particular Coordinates
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Quick Paste Field */}
          <div className="mapper-form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="mapper-label" style={{ marginBottom: 0 }}>
                Quick Paste Coordinates
              </label>
              <button 
                type="button" 
                onClick={handleGetCurrentLocation}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1a73e8',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                📍 Use My Location
              </button>
            </div>
            <input
              type="text"
              value={quickPaste}
              onChange={handleQuickPasteChange}
              placeholder="e.g. 13.0827, 80.2707"
              className="mapper-input"
            />
            <span style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', display: 'block' }}>
              Paste raw text from Google Maps or GPS.
            </span>
          </div>

          <div className="mapper-row mapper-form-group">
            {/* Latitude Field */}
            <div style={{ flex: 1 }}>
              <label className="mapper-label">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={latInput}
                onChange={(e) => { setLatInput(e.target.value); setErrorMsg(''); }}
                placeholder="e.g. 13.0827"
                className="mapper-input"
              />
            </div>

            {/* Longitude Field */}
            <div style={{ flex: 1 }}>
              <label className="mapper-label">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                required
                value={lngInput}
                onChange={(e) => { setLngInput(e.target.value); setErrorMsg(''); }}
                placeholder="e.g. 80.2707"
                className="mapper-input"
              />
            </div>
          </div>

          {/* Name / Label */}
          <div className="mapper-form-group">
            <label className="mapper-label">
              Pin Label (Optional)
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Landmark Point"
              className="mapper-input"
            />
          </div>

          {/* Marker Color Picker */}
          <div className="mapper-form-group">
            <label className="mapper-label">
              Marker Color
            </label>
            <div className="color-presets">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`color-dot ${selectedColor === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {errorMsg && (
            <div style={{ color: '#d93025', fontSize: '0.8rem', marginBottom: '12px', fontWeight: 'bold' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <button type="submit" className="mapper-btn-primary">
            Add Pinned Coordinate
          </button>
        </form>
      </div>

      {/* Pinned Locations List */}
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
          <h4 style={{ margin: 0, color: '#202124', fontSize: '1.1rem', fontWeight: '800' }}>
            Pinned Points ({pinnedLocations.length})
          </h4>
          {pinnedLocations.length > 0 && (
            <button
              onClick={onClearPins}
              style={{
                background: 'none',
                border: 'none',
                color: '#d93025',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: '700'
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {pinnedLocations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '30px 20px',
            color: '#70757a',
            background: '#fafafa',
            borderRadius: '12px',
            border: '1px dashed #ccc',
            fontSize: '0.85rem',
            margin: '0 4px'
          }}>
            No custom coordinate points mapped yet. Use the form above to pin points!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {pinnedLocations.map((pin) => (
              <div
                key={pin.id}
                onClick={() => onSelectPin(pin)}
                className={`pinned-point-card ${selectedPin?.id === pin.id ? 'selected' : ''}`}
                style={{ borderLeft: selectedPin?.id === pin.id ? `5px solid ${pin.color}` : '5px solid transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                  <span style={{ fontSize: '1.25rem', color: pin.color, marginTop: '-2px' }}>📍</span>
                  <div style={{ flex: 1, paddingRight: '70px' }}>
                    <h5>{pin.name}</h5>
                    <p style={{ fontFamily: 'monospace', color: '#1a73e8', fontWeight: 'bold' }}>
                      {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
                    </p>
                  </div>
                </div>

                {/* Floating Actions */}
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  right: '16px',
                  display: 'flex',
                  gap: '6px'
                }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(pin); }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      background: '#fff',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Copy Coordinates"
                  >
                    📋
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemovePin(pin.id); }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      background: '#fff',
                      color: '#d93025',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete Pin"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CoordinateMapper;
