import { useState } from 'react';
import MapPane from './MapPane';
import Sidebar from './Sidebar';
import './App.css';

export default function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mapCenter, setMapCenter] = useState([50.4501, 30.5234]);

    // Generalized points state
    const [points, setPoints] = useState({ start: null, end: null });
    const [pickingMode, setPickingMode] = useState(null); // 'start' | 'end' | null

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className={`app-container ${pickingMode ? 'picking-mode' : ''}`}>
            {!isSidebarOpen && (
                <button className="toggle-btn-floating" onClick={toggleSidebar}>
                    Menu
                </button>
            )}
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                setMapCenter={setMapCenter}
                points={points}
                setPoints={setPoints}
                pickingMode={pickingMode}
                setPickingMode={setPickingMode}
            />
            <MapPane
                center={mapCenter}
                points={points}
                setPoints={setPoints}
                pickingMode={pickingMode}
                setPickingMode={setPickingMode}
            />
        </div>
    );
}