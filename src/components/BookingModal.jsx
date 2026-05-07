import React from 'react';

function BookingModal({ location, onClose, onBook }) {
  if (!location) return null;

  const timeSlots = [
    '06:00 AM - 07:00 AM',
    '07:00 AM - 08:00 AM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
    '07:00 PM - 08:00 PM',
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '20px',
        width: '400px',
        maxWidth: '90%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1a73e8' }}>Book Slot</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>✕</button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 5px 0' }}>{location.name}</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{location.address}</p>
        </div>

        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Select Available Slot:</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
          {timeSlots.map(slot => (
            <button 
              key={slot} 
              onClick={() => {
                onBook(location, slot);
                onClose();
              }}
              style={{
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '10px',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#f0f7ff'}
              onMouseOut={(e) => e.target.style.background = 'white'}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
