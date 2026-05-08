import { useState, useRef } from 'react';
import MapPane from './MapPane';
import Sidebar from './Sidebar';
import { PathfindingEngine } from './engine/PathfindingEngine';
import { BreadthFirstSearch } from './engine/algorithms/BFS';
import { Dijkstra } from './engine/algorithms/Dijkstra';
import { AStar } from './engine/algorithms/AStar';
import './App.css';

export default function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mapCenter, setMapCenter] = useState([50.4501, 30.5234]);
    const [mapBounds, setMapBounds] = useState(null);

    const engineRef = useRef(new PathfindingEngine());
    // Ref to hold the active algorithm instance so we can stop/cancel it if needed
    const activeAlgoRef = useRef(null);

    const [isGraphLoading, setIsGraphLoading] = useState(false);
    const [graphStats, setGraphStats] = useState(null);
    const [graphLines, setGraphLines] = useState(null);

    const [points, setPoints] = useState({ start: null, end: null });
    const [pickingMode, setPickingMode] = useState(null);

    // NEW: Algorithm Execution State
    const [activeAlgorithm, setActiveAlgorithm] = useState('AStar');
    const [algoStats, setAlgoStats] = useState(null);
    const [isAlgoRunning, setIsAlgoRunning] = useState(false);
    const [finalPathCoords, setFinalPathCoords] = useState(null); // Array of [lat, lon]

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLoadGraph = async () => {
        if (!mapBounds) return;
        setIsGraphLoading(true);
        handleClearGraph(); // Reset everything before loading new bounds

        const result = await engineRef.current.loadGraphFromBounds(mapBounds);

        if (result.success) {
            setGraphStats({ nodes: result.nodes });
            setGraphLines(engineRef.current.getRenderableEdges());
        } else {
            alert("Failed to load map data. Try zooming in to reduce area size.");
        }
        setIsGraphLoading(false);
    };

    const handleClearGraph = () => {
        engineRef.current.clearGraph();
        setGraphStats(null);
        setGraphLines(null);
        setFinalPathCoords(null);
        setAlgoStats(null);
        if (activeAlgoRef.current) activeAlgoRef.current.isFinished = true;
    };

    // NEW: The core execution loop
    const handleRunAlgorithm = () => {
        if (!points.start || !points.end || !graphStats) {
            alert("Please load the graph and set both Start and End points first.");
            return;
        }

        // 1. Snapping
        const startNodeId = engineRef.current.getClosestNodeId(points.start[0], points.start[1]);
        const endNodeId = engineRef.current.getClosestNodeId(points.end[0], points.end[1]);

        if (!startNodeId || !endNodeId) return;

        // 2. Instantiation
        let AlgoClass;
        if (activeAlgorithm === 'BFS') AlgoClass = BreadthFirstSearch;
        else if (activeAlgorithm === 'Dijkstra') AlgoClass = Dijkstra;
        else AlgoClass = AStar;

        const algo = new AlgoClass(engineRef.current.graph, startNodeId, endNodeId);
        algo.initialize();
        activeAlgoRef.current = algo;

        setIsAlgoRunning(true);
        setFinalPathCoords(null);
        setAlgoStats(null);

        // 3. Batch Stepping (prevents UI freeze while allowing us to track stats)
        const stepLoop = () => {
            if (!activeAlgoRef.current || activeAlgoRef.current.isFinished) return;

            // Process 500 nodes per frame for speed
            for (let i = 0; i < 500; i++) {
                activeAlgoRef.current.step();
                if (activeAlgoRef.current.isFinished) break;
            }

            if (activeAlgoRef.current.isFinished) {
                setIsAlgoRunning(false);
                setAlgoStats(activeAlgoRef.current.stats);

                if (activeAlgoRef.current.path.length > 0) {
                    // Map the returned node IDs back to Lat/Lon for Leaflet to draw
                    const coords = activeAlgoRef.current.path.map(id => {
                        const n = engineRef.current.graph.nodes.get(id);
                        return [n.lat, n.lon];
                    });
                    setFinalPathCoords(coords);
                } else {
                    alert("No path found between these points!");
                }
            } else {
                // Update live stats and schedule next batch
                setAlgoStats({...activeAlgoRef.current.stats});
                requestAnimationFrame(stepLoop);
            }
        };

        requestAnimationFrame(stepLoop);
    };

    return (
        <div className={`app-container ${pickingMode ? 'picking-mode' : ''}`}>
            {/* ... Sidebar and MapPane mapping ... */}
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                setMapCenter={setMapCenter}
                points={points}
                setPoints={setPoints}
                pickingMode={pickingMode}
                setPickingMode={setPickingMode}
                onLoadGraph={handleLoadGraph}
                onClearGraph={handleClearGraph}
                isGraphLoading={isGraphLoading}
                graphStats={graphStats}
                // Pass new props
                activeAlgorithm={activeAlgorithm}
                setActiveAlgorithm={setActiveAlgorithm}
                onRunAlgorithm={handleRunAlgorithm}
                isAlgoRunning={isAlgoRunning}
                algoStats={algoStats}
            />
            <MapPane
                center={mapCenter}
                points={points}
                setPoints={setPoints}
                pickingMode={pickingMode}
                setPickingMode={setPickingMode}
                setMapBounds={setMapBounds}
                graphLines={graphLines}
                // Pass the path to draw
                finalPathCoords={finalPathCoords}
            />
        </div>
    );
}