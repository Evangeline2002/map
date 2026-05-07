import React from 'react';

const ConfigCheck = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isKeyPresent = apiKey && apiKey !== 'YOUR_API_KEY_HERE';

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      background: isKeyPresent ? '#d4edda' : '#fff3cd',
      color: isKeyPresent ? '#155724' : '#856404',
      padding: '10px 15px',
      borderRadius: '8px',
      fontSize: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      border: `1px solid ${isKeyPresent ? '#c3e6cb' : '#ffeeba'}`
    }}>
      <strong>Map Mode:</strong> {isKeyPresent ? 'Google Maps (Live)' : 'Free Mode (Leaflet)'}
      {!isKeyPresent && <div style={{marginTop: '5px'}}>Add Google API Key to .env to switch to Google Maps.</div>}
    </div>
  );
};

export default ConfigCheck;
