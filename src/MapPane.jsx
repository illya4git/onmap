import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

// Generalized MapClickHandler
function MapClickHandler({ pickingMode, setPickingMode, setPoints }) {
    useMapEvents({
        click(e) {
            // Because pickingMode is exactly "start" or "end", we can use it as the object key!
            if (pickingMode) {
                setPoints(prev => ({
                    ...prev,
                    [pickingMode]: [e.latlng.lat, e.latlng.lng]
                }));
                setPickingMode(null); // Exit picking mode automatically
            }
        }
    });
    return null;
}

export default function MapPane({ center, points, setPoints, pickingMode, setPickingMode }) {
    return (
        <div className="map-wrapper">
            <MapContainer
                center={center}
                zoom={13}
                zoomControl={false}
                style={{ width: "100%", height: "100%", cursor: pickingMode ? 'crosshair' : 'grab' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                    url="https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png"
                />

                <MapUpdater center={center} />

                <MapClickHandler
                    pickingMode={pickingMode}
                    setPickingMode={setPickingMode}
                    setPoints={setPoints}
                />

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