import PointInput from './PointInput';
import SearchBar from './SearchBar';

export default function Sidebar({
                                    isOpen, toggleSidebar, setMapCenter,
                                    points, setPoints,
                                    pickingMode, setPickingMode,
                                    onLoadGraph, onClearGraph, isGraphLoading, graphStats,
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

                <div className="control-group">
                    <h3>Network Graph</h3>
                    {!graphStats ? (
                        <button
                            onClick={onLoadGraph}
                            disabled={isGraphLoading}
                            style={{ padding: '8px', width: '100%', cursor: 'pointer', marginBottom: '10px' }}
                        >
                            {isGraphLoading ? 'Downloading & Parsing...' : 'Load Area into Engine'}
                        </button>
                    ) : (
                        <>
                            <p style={{fontSize: '0.85rem', color: '#16a34a', marginBottom: '10px', fontWeight: 'bold'}}>
                                Graph ready! Nodes: {graphStats.nodes}
                            </p>
                            <button
                                onClick={onClearGraph}
                                style={{ padding: '8px', width: '100%', cursor: 'pointer', backgroundColor: '#fecaca', border: '1px solid #ef4444' }}
                            >
                                Clear Graph & Show Map
                            </button>
                        </>
                    )}
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

                <div className="control-group">
                    <h3>Runner</h3>
                    <select
                        value={activeAlgorithm}
                        onChange={(e) => setActiveAlgorithm(e.target.value)}
                        disabled={isAlgoRunning && !isPaused}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                    >
                        <option value="BFS">Breadth-First Search</option>
                        <option value="Dijkstra">Dijkstra's Algorithm</option>
                        <option value="AStar">A* Search</option>
                    </select>

                    <button
                        onClick={onRunAlgorithm}
                        disabled={isAlgoRunning && !isPaused}
                        style={{ padding: '10px', width: '100%', cursor: 'pointer', backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px' }}
                    >
                        {isAlgoRunning ? (isPaused ? 'Restart Path' : 'Running...') : 'Find Path'}
                    </button>

                    {/* NEW: Timeline Controls */}
                    <div style={{ marginTop: '15px' }}>
                        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>
                            Speed (steps/frame): {playbackSpeed}
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="500"
                            value={playbackSpeed}
                            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                disabled={!isAlgoRunning}
                                style={{ flex: 1, padding: '8px', cursor: isAlgoRunning ? 'pointer' : 'default', border: '1px solid #ccc', borderRadius: '4px', background: isPaused ? '#e2e8f0' : 'white' }}
                            >
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                            <button
                                onClick={onStepForward}
                                disabled={!isAlgoRunning || !isPaused}
                                style={{ flex: 1, padding: '8px', cursor: (isAlgoRunning && isPaused) ? 'pointer' : 'default', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }}
                            >
                                Step
                            </button>
                        </div>
                    </div>

                    {/* Stats Readout */}
                    {algoStats && (
                        <div style={{ marginTop: '15px', fontSize: '0.85rem', background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                            <p><strong>Nodes Explored:</strong> {algoStats.nodesExplored}</p>
                            <p><strong>Max Frontier Size:</strong> {algoStats.maxFrontierSize}</p>
                            <p><strong>Time:</strong> {algoStats.executionTimeMs.toFixed(2)} ms</p>
                            <p><strong>Distance:</strong> {(algoStats.pathDistanceMeters / 1000).toFixed(2)} km</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}