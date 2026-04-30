const CITIES = {
  in: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad",
       "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
       "Visakhapatnam", "Pimpri", "Patna", "Vadodara", "Coimbatore", "Trichy", "Madurai",
       "Noida", "Gurgaon", "Chandigarh", "Kochi", "Mysore", "Nashik", "Agra", "Remote"],
  us: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio",
       "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "San Francisco", "Seattle",
       "Denver", "Boston", "Nashville", "Portland", "Las Vegas", "Remote"],
  gb: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Bradford",
       "Edinburgh", "Liverpool", "Bristol", "Cardiff", "Leicester", "Coventry", "Remote"],
  au: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra",
       "Newcastle", "Wollongong", "Hobart", "Remote"],
  ca: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg",
       "Quebec City", "Hamilton", "Kitchener", "Remote"],
  de: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf",
       "Leipzig", "Dortmund", "Essen", "Remote"],
  sg: ["Singapore", "Jurong", "Tampines", "Woodlands", "Ang Mo Kio", "Remote"],
};

export default function LocationInput({ value, onChange, country }) {
  const cities = CITIES[country] || CITIES["in"];
  const suggestions = value.length >= 1
    ? cities.filter((c) => c.toLowerCase().startsWith(value.toLowerCase()) && c.toLowerCase() !== value.toLowerCase())
    : [];

  return (
    <div className="location-wrap">
      <span className="search-icon">📍</span>
      <input
        placeholder="Location (e.g. Chennai)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="city-dropdown">
          {suggestions.slice(0, 6).map((c) => (
            <li key={c} onMouseDown={() => onChange(c)}>
              📍 {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
