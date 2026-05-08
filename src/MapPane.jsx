import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, CircleMarker, Tooltip, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Component to handle programmatic flying
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

// Intercepts clicks for setting points
function MapClickHandler({ pickingMode, setPickingMode, setPoints }) {
    useMapEvents({
        click(e) {
            if (pickingMode) {
                setPoints(prev => ({
                    ...prev,
                    [pickingMode]: [e.latlng.lat, e.latlng.lng]
                }));
                setPickingMode(null);
            }
        }
    });
    return null;
}

// Tracks the current bounding box of the map to feed into our engine
function BoundsTracker({ setMapBounds }) {
    const map = useMapEvents({
        moveend: () => {
            setMapBounds(map.getBounds());
        },
        zoomend: () => {
            setMapBounds(map.getBounds());
        }
    });

    // Run once on mount to get initial bounds
    useEffect(() => {
        setMapBounds(map.getBounds());
    }, [map, setMapBounds]);

    return null;
}

export default function MapPane({ center, points, setPoints, pickingMode, setPickingMode, setMapBounds, graphLines, finalPathCoords }) {
    const isGraphLoaded = graphLines && graphLines.length > 0;

    return (
        <div className="map-wrapper" style={{ backgroundColor: isGraphLoaded ? '#1e1e1e' : 'transparent' }}>
            <MapContainer
                center={center}
                zoom={13}
                zoomControl={false}
                style={{ width: "100%", height: "100%", cursor: pickingMode ? 'crosshair' : 'grab' }}
            >
                {!isGraphLoaded && (
                    <TileLayer
                        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>...'
                        url="https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png"
                    />
                )}

                <MapUpdater center={center} />
                <BoundsTracker setMapBounds={setMapBounds} />

                <MapClickHandler
                    pickingMode={pickingMode}
                    setPickingMode={setPickingMode}
                    setPoints={setPoints}
                />

                {/* Render the extracted Graph Edges */}
                {isGraphLoaded && graphLines.map((line, idx) => (
                    <Polyline
                        key={`edge-${idx}`}
                        positions={line}
                        pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.5 }}
                    />
                ))}

                {/* NEW: Render the Solved Path */}
                {finalPathCoords && (
                    <Polyline
                        positions={finalPathCoords}
                        pathOptions={{ color: '#facc15', weight: 6, opacity: 1, lineJoin: 'round' }}
                    />
                )}

                {points.start && (
                    <CircleMarker center={points.start} radius={8} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.8 }}>
                        <Tooltip permanent direction="top">Start</Tooltip>
                    </CircleMarker>
                )}

                {points.end && (
                    <CircleMarker center={points.end} radius={8} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.8 }}>
                        <Tooltip permanent direction="top">End</Tooltip>
                    </CircleMarker>
                )}

            </MapContainer>
        </div>
    )
}