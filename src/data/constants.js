export const TAMIL_NADU_CENTER = { lat: 11.1271, lng: 78.6569 };
export const DEFAULT_ZOOM = 7;

export const TAMIL_NADU_BOUNDS = {
  north: 13.5,
  south: 8.0,
  west: 76.0,
  east: 80.5,
};

export const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", 
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", 
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", 
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", 
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", 
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", 
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", 
  "Vellore", "Viluppuram", "Virudhunagar"
];

export const SPORTS_CATEGORIES = [
  'Turf',
  'Football',
  'Swimming',
  'Sports Hub/club',
  'Cricket/Tennis/Hockey/Basketball/Volleyball',
  'School/Class/Badmitton',
  'Academy',
  'Others'
];

export const CATEGORY_COLORS = {
  'Turf': '#f44336', // Vibrant Red
  'Football': '#4caf50', // Forest Green
  'Swimming': '#2196f3', // Deep Blue
  'Sports Hub/club': '#ff9800', // Amber/Orange
  'Cricket/Tennis/Hockey/Basketball/Volleyball': '#e91e63', // Rose Pink
  'School/Class/Badmitton': '#009688', // Teal
  'Academy': '#ffc107', // Gold/Amber
  'Others': '#607d8b', // Blue Grey
  'default': '#1a73e8'
};

export const getCategoryColor = (type) => {
  const normalizedType = type?.toLowerCase().trim();
  if (normalizedType.includes('turf')) return CATEGORY_COLORS['Turf'];
  if (normalizedType.includes('football')) return CATEGORY_COLORS['Football'];
  if (normalizedType.includes('swimming')) return CATEGORY_COLORS['Swimming'];
  if (normalizedType.includes('club') || normalizedType.includes('hub')) return CATEGORY_COLORS['Sports Hub/club'];
  if (normalizedType.includes('cricket') || normalizedType.includes('tennis') || normalizedType.includes('hockey') || normalizedType.includes('basketball') || normalizedType.includes('volleyball')) return CATEGORY_COLORS['Cricket/Tennis/Hockey/Basketball/Volleyball'];
  if (normalizedType.includes('school') || normalizedType.includes('class') || normalizedType.includes('badmitton')) return CATEGORY_COLORS['School/Class/Badmitton'];
  if (normalizedType.includes('academy')) return CATEGORY_COLORS['Academy'];
  
  return CATEGORY_COLORS['Others'];
};
