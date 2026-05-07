import { useState, useEffect } from 'react';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import * as XLSX from 'xlsx';
import { SPORTS_CATEGORIES } from '../data/constants';

function AdminPanel({ onLocationAdded, adminLatLng, onComplete }) {
  const [formData, setFormData] = useState({
    name: '', address: '', phone: '', timings: '',
    lat: '', lng: '', district: '', type: ''
  });
  const [isImportingAll, setIsImportingAll] = useState(false);
  const [isImportingSelected, setIsImportingSelected] = useState(false);
  const [importProgress, setImportProgress] = useState('');

  useEffect(() => {
    if (adminLatLng?.lat && adminLatLng?.lng) {
      setFormData(prev => ({
        ...prev,
        lat: adminLatLng.lat.toString(),
        lng: adminLatLng.lng.toString()
      }));
    }
  }, [adminLatLng]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      };
      await addDoc(collection(db, 'locations'), dataToSave);
      if (onLocationAdded) onLocationAdded(dataToSave);
      setFormData({ name: '', address: '', phone: '', timings: '', lat: '', lng: '', district: '', type: '' });
      alert('Location added successfully!');
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error adding location: ', error);
      alert('Failed to add location.');
    }
  };

  const [workbook, setWorkbook] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');

  const handleFileLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      setWorkbook(wb);
      setAvailableSheets(wb.SheetNames);
      setSelectedSheet(wb.SheetNames[0]);
    };
    reader.readAsBinaryString(file);
  };

  const processData = (data, districtName) => {
    return data.map(item => ({
      name: item.name || item.Name || item['Venue Name'] || '',
      type: item.category || item.Category || item.Sport || item.Type || 'Others',
      address: item.address || item.Address || item.Location || '',
      phone: item.phone || item.Phone || item.Mobile || '',
      district: districtName,
      lat: parseFloat(item.lat || item.Latitude || item.LAT || 0),
      lng: parseFloat(item.lng || item.Longitude || item.LNG || 0),
      timings: item.timings || item.Timings || '6 AM - 10 PM'
    }));
  };

  const uploadInChunks = async (allData) => {
    const CHUNK_SIZE = 500;
    const chunks = [];
    for (let i = 0; i < allData.length; i += CHUNK_SIZE) {
      chunks.push(allData.slice(i, i + CHUNK_SIZE));
    }

    console.log(`🚀 Starting upload of ${allData.length} locations...`);
    for (let i = 0; i < chunks.length; i += 5) {
      const currentChunks = chunks.slice(i, i + 5);
      const currentCount = Math.min((i + 5) * CHUNK_SIZE, allData.length);
      setImportProgress(`Uploading ${currentCount} / ${allData.length}...`);
      console.log(`📦 Progress: ${currentCount} / ${allData.length} uploaded.`);
      
      await Promise.all(currentChunks.map(async (chunk, index) => {
        const batch = writeBatch(db);
        chunk.forEach(loc => {
          const newDocRef = doc(collection(db, 'locations'));
          batch.set(newDocRef, loc);
        });
        await batch.commit();
        console.log(`✅ Batch ${i / CHUNK_SIZE + index + 1} committed successfully.`);
      }));
    }
    console.log("🏁 All data uploaded successfully!");
    setImportProgress('✅ Upload complete! Saving...');
  };

  const handleImportAllSheets = async () => {
    if (!workbook) return;
    setIsImportingAll(true);
    setImportProgress('Reading Excel...');
    try {
      let combinedData = [];
      workbook.SheetNames.forEach(sheetName => {
        const ws = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws);
        combinedData = [...combinedData, ...processData(data, sheetName)];
      });

      await uploadInChunks(combinedData);
      alert(`Successfully imported all ${combinedData.length} locations!`);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Import Error:', err);
      alert('Failed to import all sheets.');
    } finally {
      setIsImportingAll(false);
      setImportProgress('');
    }
  };

  const handleImportSelectedSheet = async () => {
    if (!workbook || !selectedSheet) return;
    setIsImportingSelected(true);
    setImportProgress(`Reading ${selectedSheet}...`);
    try {
      const ws = workbook.Sheets[selectedSheet];
      const data = XLSX.utils.sheet_to_json(ws);
      const processed = processData(data, selectedSheet);
      await uploadInChunks(processed);
      alert(`Successfully imported ${processed.length} locations for ${selectedSheet}!`);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Import Error:', err);
      alert('Failed to import selected sheet.');
    } finally {
      setIsImportingSelected(false);
      setImportProgress('');
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-section">
        <h3>Excel Import (Single Sheet)</h3>
        <p style={{fontSize: '0.8rem', color: '#666'}}>1. Choose your Excel file first.</p>
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileLoad} 
          disabled={isImportingAll || isImportingSelected}
          style={{marginBottom: '15px'}}
        />

        {availableSheets.length > 0 && (
          <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '15px', border: '2px solid #e0e0e0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <button 
              onClick={handleImportAllSheets}
              disabled={isImportingAll || isImportingSelected}
              style={{ 
                width: '100%', 
                background: '#34a853', 
                color: 'white', 
                padding: '12px', 
                borderRadius: '8px', 
                border: 'none', 
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '15px',
                opacity: (isImportingAll || isImportingSelected) ? 0.7 : 1
              }}
            >
              {isImportingAll ? 'Importing All...' : 'Import ALL 38 Sheets Now'}
            </button>

            <div style={{ borderTop: '1px solid #ddd', paddingTop: '15px' }}>
              <p style={{fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 10px 0'}}>OR Select a Single Sheet (District):</p>
              <select 
                value={selectedSheet} 
                onChange={(e) => setSelectedSheet(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}
                disabled={isImportingAll || isImportingSelected}
              >
                {availableSheets.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <button 
                onClick={handleImportSelectedSheet}
                disabled={isImportingAll || isImportingSelected}
                style={{ 
                  width: '100%', 
                  background: '#1a73e8', 
                  color: 'white', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: (isImportingAll || isImportingSelected) ? 0.7 : 1
                }}
              >
                {isImportingSelected ? 'Importing...' : `Import Only ${selectedSheet}`}
              </button>
            </div>
            
            {importProgress && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#e8f0fe', borderRadius: '8px', textAlign: 'center', fontSize: '0.85rem', color: '#1a73e8', fontWeight: 'bold' }}>
                ⏳ {importProgress}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="admin-section" style={{borderTop: '1px solid #eee', paddingTop: '20px'}}>
        <h3>Add Single Location</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
          <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" required />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
          <input name="timings" value={formData.timings} onChange={handleChange} placeholder="Timings" required />
          <div className="row">
            <input name="lat" value={formData.lat} onChange={handleChange} placeholder="Latitude" required />
            <input name="lng" value={formData.lng} onChange={handleChange} placeholder="Longitude" required />
          </div>
          <input name="district" value={formData.district} onChange={handleChange} placeholder="District" required />
          <select name="type" value={formData.type} onChange={handleChange} required>
            <option value="">Select Category</option>
            {SPORTS_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button type="submit">Add Location</button>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;