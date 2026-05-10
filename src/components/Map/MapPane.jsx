import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents, CircleMarker, Tooltip, Polyline } from 'react-leaflet';
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

function BoundsTracker({ setMapBounds, setMapZoom }) {
    const map = useMapEvents({
        moveend: () => setMapBounds(map.getBounds()),
        zoomend: () => {
            setMapBounds(map.getBounds());
            setMapZoom(map.getZoom());
        }
    });

    useEffect(() => {
        setMapBounds(map.getBounds());
        setMapZoom(map.getZoom());
    }, [map, setMapBounds, setMapZoom]);

    return null;
}

export default function MapPane({ center, points, setPoints, pickingMode, setPickingMode, setMapBounds, setMapZoom, graphLines, finalPathCoords, visitedEdges, frontierCoords }) {
    const isGraphLoaded = graphLines && graphLines.length > 0;

    return (
        <div className={`map-wrapper ${isGraphLoaded ? 'graph-loaded' : ''}`}>
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

                {/* Updated BoundsTracker to pass setMapZoom */}
                <BoundsTracker setMapBounds={setMapBounds} setMapZoom={setMapZoom} />

                <MapClickHandler pickingMode={pickingMode} setPickingMode={setPickingMode} setPoints={setPoints} />

                {/* Render the Base Graph Edges */}
                {isGraphLoaded && (
                    <Polyline
                        positions={graphLines}
                        pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.5 }}
                    />
                )}

                {/* NEW: Visited Edges (Search Tree) mapped as a MultiPolyline for performance */}
                {visitedEdges && visitedEdges.length > 0 && (
                    <Polyline
                        positions={visitedEdges}
                        pathOptions={{ color: '#a855f7', weight: 3, opacity: 0.6 }}
                    />
                )}

                {/* NEW: Frontier Nodes */}
                {frontierCoords && frontierCoords.map((coord, idx) => (
                    <CircleMarker
                        key={`frontier-${idx}`}
                        center={coord}
                        radius={4}
                        pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.9, weight: 0 }}
                    />
                ))}

                {/* Final Resolved Path */}
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