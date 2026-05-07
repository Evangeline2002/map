import pandas as pd
import json

# District coordinates mapping
DISTRICT_COORDS = {
    "Ariyalur": {"lat": 11.14, "lng": 79.08},
    "Chengalpattu": {"lat": 12.69, "lng": 79.98},
    "Chennai": {"lat": 13.08, "lng": 80.27},
    "Coimbatore": {"lat": 11.01, "lng": 76.96},
    "Cuddalore": {"lat": 11.75, "lng": 79.76},
    "Dharmapuri": {"lat": 12.13, "lng": 78.16},
    "Dindigul": {"lat": 10.36, "lng": 77.96},
    "Erode": {"lat": 11.34, "lng": 77.72},
    "Kallakurichi": {"lat": 11.75, "lng": 78.97},
    "Kanchipuram": {"lat": 12.83, "lng": 79.70},
    "Kanniyakumari": {"lat": 8.23, "lng": 77.53},
    "Karur": {"lat": 10.96, "lng": 78.08},
    "Krishnagiri": {"lat": 12.53, "lng": 78.22},
    "Madurai": {"lat": 9.93, "lng": 78.12},
    "Mayiladuthurai": {"lat": 11.10, "lng": 79.65},
    "Nagapattinam": {"lat": 10.77, "lng": 79.84},
    "Namakkal": {"lat": 11.23, "lng": 78.16},
    "Nilgiris": {"lat": 11.41, "lng": 76.70},
    "Perambalur": {"lat": 11.23, "lng": 78.88},
    "Pudukkottai": {"lat": 10.38, "lng": 78.82},
    "Ramanathapuram": {"lat": 9.37, "lng": 78.83},
    "Ranipet": {"lat": 12.92, "lng": 79.33},
    "Salem": {"lat": 11.66, "lng": 78.14},
    "Sivagangai": {"lat": 9.85, "lng": 78.48},
    "Tenkasi": {"lat": 8.97, "lng": 77.30},
    "Thanjavur": {"lat": 10.79, "lng": 79.13},
    "Theni": {"lat": 10.01, "lng": 77.47},
    "Thoothukudi": {"lat": 8.80, "lng": 78.03},
    "Tiruchirappalli": {"lat": 10.79, "lng": 78.70},
    "Tirunelveli": {"lat": 8.71, "lng": 77.76},
    "Tirupathur": {"lat": 12.49, "lng": 78.56},
    "Tiruppur": {"lat": 11.10, "lng": 77.34},
    "Tiruvallur": {"lat": 13.14, "lng": 79.91},
    "Tiruvannamalai": {"lat": 12.22, "lng": 79.07},
    "Tiruvarur": {"lat": 10.77, "lng": 79.63},
    "Vellore": {"lat": 12.91, "lng": 79.13},
    "Viluppuram": {"lat": 11.94, "lng": 79.49},
    "Virudhunagar": {"lat": 9.58, "lng": 77.96}
}

def normalize_type(raw_type):
    if not isinstance(raw_type, str):
        return "sport related spot"
    t = raw_type.lower()
    if 'turf' in t:
        return "turf"
    if 'swimming' in t:
        return "swimming"
    if 'hub' in t or 'club' in t:
        return "sport club/hub"
    return "sport related spot"

# Read the Excel file
excel_path = r'c:\Users\Asus\OneDrive\Desktop\TamilNadu_Sports_Data.xlsx'
xl = pd.ExcelFile(excel_path)

all_data = []
counter = 1

for sheet_name in xl.sheet_names:
    if sheet_name == 'Master_Data':
        continue
    
    df = pd.read_excel(excel_path, sheet_name=sheet_name)
    if df.empty:
        continue
    
    # Replace NaN with empty string to avoid invalid JSON
    df = df.fillna('')
        
    for _, row in df.iterrows():
        district = row.get('District', sheet_name)
        coords = DISTRICT_COORDS.get(district, {"lat": 11.12, "lng": 78.65})
        
        # Add slight jitter to coordinates so markers don't overlap perfectly
        import random
        jitter_lat = (random.random() - 0.5) * 0.05
        jitter_lng = (random.random() - 0.5) * 0.05
        
        entry = {
            "id": counter,
            "name": str(row.get('Name', 'Unknown Venue')),
            "address": str(row.get('Address', 'N/A')),
            "phone": str(row.get('Phone', 'N/A')),
            "timings": "6 AM - 10 PM",
            "lat": coords['lat'] + jitter_lat,
            "lng": coords['lng'] + jitter_lng,
            "district": district,
            "type": normalize_type(row.get('Category')),
            "availableSlots": ["6 AM", "7 AM", "4 PM", "5 PM"]
        }
        all_data.append(entry)
        counter += 1

# Save to JSON file in the project
with open('src/data/tamilNaduSportsData.json', 'w') as f:
    json.dump(all_data, f, indent=4)

print(f"Normalized Excel data converted to JSON successfully! Processed {len(all_data)} records.")