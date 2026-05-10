import { useState } from 'react';

export function useMapState() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mapCenter, setMapCenter] = useState([50.4501, 30.5234]);
    const [mapBounds, setMapBounds] = useState(null);
    const [mapZoom, setMapZoom] = useState(13);

    const [points, setPoints] = useState({ start: null, end: null });
    const [pickingMode, setPickingMode] = useState(null);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return {
        isSidebarOpen, toggleSidebar,
        mapCenter, setMapCenter,
        mapBounds, setMapBounds,
        mapZoom, setMapZoom,
        points, setPoints,
        pickingMode, setPickingMode
    };
}