import './Controls.css';

export default function AlgorithmControls({
                                              activeAlgorithm,
                                              setActiveAlgorithm,
                                              onRunAlgorithm,
                                              isAlgoRunning,
                                              isPaused,
                                              setIsPaused,
                                              playbackSpeed,
                                              setPlaybackSpeed,
                                              onStepForward,
                                              algoStats
                                          }) {
    return (
        <div className="control-group">
            <h3>Runner</h3>
            <select
                className="runner-select"
                value={activeAlgorithm}
                onChange={(e) => setActiveAlgorithm(e.target.value)}
                disabled={isAlgoRunning && !isPaused}
            >
                <option value="BFS">Breadth-First Search</option>
                <option value="Dijkstra">Dijkstra's Algorithm</option>
                <option value="AStar">A* Search</option>
            </select>

            <button
                className="btn-run-algo"
                onClick={onRunAlgorithm}
                disabled={isAlgoRunning && !isPaused}
            >
                {isAlgoRunning ? (isPaused ? 'Restart Path' : 'Running...') : 'Find Path'}
            </button>

            <div className="timeline-controls">
                <label className="speed-label">
                    Speed (steps/frame): {playbackSpeed}
                </label>
                <input
                    className="speed-slider"
                    type="range"
                    min="1"
                    max="500"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                />
                <div className="step-buttons-container">
                    <button
                        className={`btn-step ${isPaused ? 'active' : ''}`}
                        onClick={() => setIsPaused(!isPaused)}
                        disabled={!isAlgoRunning}
                    >
                        {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                        className="btn-step"
                        onClick={onStepForward}
                        disabled={!isAlgoRunning || !isPaused}
                    >
                        Step
                    </button>
                </div>
            </div>

            {algoStats && (
                <div className="stats-panel">
                    <p><strong>Nodes Explored:</strong> {algoStats.nodesExplored}</p>
                    <p><strong>Max Frontier Size:</strong> {algoStats.maxFrontierSize}</p>
                    <p><strong>Time:</strong> {algoStats.executionTimeMs.toFixed(2)} ms</p>
                    <p><strong>Distance:</strong> {(algoStats.pathDistanceMeters / 1000).toFixed(2)} km</p>
                </div>
            )}
        </div>
    );
}