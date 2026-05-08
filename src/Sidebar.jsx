import PointInput from './PointInput';
import SearchBar from './SearchBar';

export default function Sidebar({
                                    isOpen, toggleSidebar, setMapCenter,
                                    points, setPoints,
                                    pickingMode, setPickingMode
                                }) {

    // Closure to dynamically update the specific point type
    const updatePoint = (type) => (newPoint) => {
        setPoints(prev => ({ ...prev, [type]: newPoint }));
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <h2>Map Controls</h2>
                <button onClick={toggleSidebar}>Close</button>
            </div>
            <div className="sidebar-content">

                <div className="control-group">
                    <h3>City Center</h3>
                    <SearchBar setMapCenter={setMapCenter} />
                </div>

                <div className="control-group">
                    <h3>Pathfinding Points</h3>
                    <PointInput
                        type="start"
                        label="Start Point"
                        point={points.start}
                        setPoint={updatePoint('start')}
                        pickingMode={pickingMode}
                        setPickingMode={setPickingMode}
                    />
                    <PointInput
                        type="end"
                        label="End Point"
                        point={points.end}
                        setPoint={updatePoint('end')}
                        pickingMode={pickingMode}
                        setPickingMode={setPickingMode}
                    />
                </div>

            </div>
        </aside>
    );
}