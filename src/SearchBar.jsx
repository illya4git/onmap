import { useState, useEffect } from 'react';

export default function SearchBar({ setMapCenter }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 2) {
                setIsSearching(true);
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&featuretype=city`);
                    const data = await response.json();
                    setResults(data);
                } catch (error) {
                    console.error("Error fetching city data:", error);
                    setResults([]);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelectCity = (lat, lon, displayName) => {
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
        setQuery(displayName.split(',')[0]); // Clean up the input string
        setResults([]); // Hide dropdown
    };

    return (
        <div className="search-container">
            <input
                type="text"
                placeholder="Search for a city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
            />
            {isSearching && <span className="searching-text">Searching...</span>}
            {results.length > 0 && (
                <ul className="search-results">
                    {results.map((result) => (
                        <li key={result.place_id} onClick={() => handleSelectCity(result.lat, result.lon, result.display_name)}>
                            {result.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}