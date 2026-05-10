import PointInput from './PointInput.jsx';
import SearchBar from './SearchBar.jsx';
import GraphControls from './GraphControls.jsx';
import AlgorithmControls from './AlgorithmControls.jsx';

export default function Sidebar({
                                    isOpen, toggleSidebar, setMapCenter,
                                    points, setPoints,
                                    pickingMode, setPickingMode,
                                    onLoadGraph, onClearGraph, isGraphLoading, graphStats, mapZoom,
                                    activeAlgorithm, setActiveAlgorithm, onRunAlgorithm, isAlgoRunning, algoStats,
                                    playbackSpeed, setPlaybackSpeed, isPaused, setIsPaused, onStepForward
                                }) {

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

                <GraphControls
                    mapZoom={mapZoom}
                    graphStats={graphStats}
                    onLoadGraph={onLoadGraph}
                    onClearGraph={onClearGraph}
                    isGraphLoading={isGraphLoading}
                />

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

                <AlgorithmControls
                    activeAlgorithm={activeAlgorithm}
                    setActiveAlgorithm={setActiveAlgorithm}
                    onRunAlgorithm={onRunAlgorithm}
                    isAlgoRunning={isAlgoRunning}
                    isPaused={isPaused}
                    setIsPaused={setIsPaused}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                    onStepForward={onStepForward}
                    algoStats={algoStats}
                />

            </div>
        </aside>
    );
}