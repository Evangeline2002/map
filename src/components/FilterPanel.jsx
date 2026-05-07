import { SPORTS_CATEGORIES } from '../data/constants';

function FilterPanel({ districts, selectedDistrict, selectedType, onDistrictChange, onTypeChange }) {
  return (
    <div className="filter-panel" style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '700', color: '#5f6368' }}>District</label>
        <select 
          value={selectedDistrict} 
          onChange={(e) => onDistrictChange(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', background: '#fff' }}
        >
          <option value="">All Districts (38)</option>
          {districts.map((district) => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '700', color: '#5f6368' }}>Category</label>
        <select 
          value={selectedType} 
          onChange={(e) => onTypeChange(e.target.value)}
          style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', background: '#fff' }}
        >
          <option value="">All Categories</option>
          {SPORTS_CATEGORIES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default FilterPanel;