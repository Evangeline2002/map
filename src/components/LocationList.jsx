function LocationList({ locations, onLocationClick, onBookClick }) {
  return (
    <div className="location-list">
      <h2>Sports Locations in Tamil Nadu</h2>
      <ul>
        {locations.map((location) => (
          <li key={location.id} onClick={() => onLocationClick(location)}>
            <h3>{location.name}</h3>
            <p>{location.address}</p>
            <p>District: {location.district} | Type: {location.type}</p>
            <p>Phone: {location.phone} | Timings: {location.timings}</p>
            <button onClick={(e) => { e.stopPropagation(); onBookClick(location); }}>Book Slot</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LocationList;