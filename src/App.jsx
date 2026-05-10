import { useState, useRef, useEffect } from 'react';
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
    const [mapZoom, setMapZoom] = useState(13);

    const engineRef = useRef(new PathfindingEngine());
    const activeAlgoRef = useRef(null);
    const rafRef = useRef(null);

    const [isGraphLoading, setIsGraphLoading] = useState(false);
    const [graphStats, setGraphStats] = useState(null);
    const [graphLines, setGraphLines] = useState(null);

    const [points, setPoints] = useState({ start: null, end: null });
    const [pickingMode, setPickingMode] = useState(null);

    const [activeAlgorithm, setActiveAlgorithm] = useState('AStar');
    const [algoStats, setAlgoStats] = useState(null);
    const [isAlgoRunning, setIsAlgoRunning] = useState(false);
    const [finalPathCoords, setFinalPathCoords] = useState(null);

    // NEW: Visualization & Timeline states
    const [playbackSpeed, setPlaybackSpeed] = useState(50); // Steps per frame
    const [isPaused, setIsPaused] = useState(false);
    const [visitedEdges, setVisitedEdges] = useState(null);
    const [frontierCoords, setFrontierCoords] = useState(null);

    // Refs to read sync values inside requestAnimationFrame without stale closures
    const speedRef = useRef(playbackSpeed);
    const pausedRef = useRef(isPaused);

    useEffect(() => { speedRef.current = playbackSpeed; }, [playbackSpeed]);
    useEffect(() => { pausedRef.current = isPaused; }, [isPaused]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLoadGraph = async () => {
        if (!mapBounds) return;
        setIsGraphLoading(true);
        handleClearGraph();

        // Pass both bounds and mapZoom to the engine
        const result = await engineRef.current.loadGraphFromBounds(mapBounds, mapZoom);

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
        setVisitedEdges(null);
        setFrontierCoords(null);
        setIsAlgoRunning(false);
        if (activeAlgoRef.current) activeAlgoRef.current.isFinished = true;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    // Extracts the current pathfinding tree and frontier to standard arrays for Leaflet
    const updateVisuals = () => {
        const algo = activeAlgoRef.current;
        if (!algo) return;

        // Extract search tree lines
        const vEdges = [];
        for (const [nodeId, parentId] of algo.cameFrom.entries()) {
            const node = engineRef.current.graph.nodes.get(nodeId);
            const parent = engineRef.current.graph.nodes.get(parentId);
            if (node && parent) {
                vEdges.push([[parent.lat, parent.lon], [node.lat, node.lon]]);
            }
        }
        setVisitedEdges(vEdges);

        // Extract frontier points
        const fCoords = algo.frontier.map(id => {
            const n = engineRef.current.graph.nodes.get(id);
            return n ? [n.lat, n.lon] : null;
        }).filter(Boolean);

        setFrontierCoords(fCoords);
        setAlgoStats({...algo.stats});
    };

    const handleFinish = () => {
        setIsAlgoRunning(false);
        setAlgoStats(activeAlgoRef.current.stats);

        if (activeAlgoRef.current.path.length > 0) {
            const coords = activeAlgoRef.current.path.map(id => {
                const n = engineRef.current.graph.nodes.get(id);
                return [n.lat, n.lon];
            });
            setFinalPathCoords(coords);
        } else {
            alert("No path found between these points!");
        }
    };

    const stepLoop = () => {
        if (!activeAlgoRef.current || activeAlgoRef.current.isFinished) return;

        if (!pausedRef.current) {
            // Process chunks based on speed slider
            for (let i = 0; i < speedRef.current; i++) {
                activeAlgoRef.current.step();
                if (activeAlgoRef.current.isFinished) break;
            }
            updateVisuals();
        }

        if (activeAlgoRef.current.isFinished) {
            handleFinish();
        } else {
            rafRef.current = requestAnimationFrame(stepLoop);
        }
    };

    // Re-trigger the loop when user unpauses
    useEffect(() => {
        if (!isPaused && isAlgoRunning && activeAlgoRef.current && !activeAlgoRef.current.isFinished) {
            rafRef.current = requestAnimationFrame(stepLoop);
        }
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isPaused, isAlgoRunning]);

    const handleRunAlgorithm = () => {
        if (!points.start || !points.end || !graphStats) {
            alert("Please load the graph and set both Start and End points first.");
            return;
        }

        const startNodeId = engineRef.current.getClosestNodeId(points.start[0], points.start[1]);
        const endNodeId = engineRef.current.getClosestNodeId(points.end[0], points.end[1]);

        if (!startNodeId || !endNodeId) return;

        let AlgoClass;
        if (activeAlgorithm === 'BFS') AlgoClass = BreadthFirstSearch;
        else if (activeAlgorithm === 'Dijkstra') AlgoClass = Dijkstra;
        else AlgoClass = AStar;

        const algo = new AlgoClass(engineRef.current.graph, startNodeId, endNodeId);
        algo.initialize();
        activeAlgoRef.current = algo;

        setIsAlgoRunning(true);
        setIsPaused(false);
        pausedRef.current = false;

        setFinalPathCoords(null);
        setVisitedEdges(null);
        setFrontierCoords(null);
        setAlgoStats(null);

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(stepLoop);
    };

    // Manual Stepper
    const handleStepForward = () => {
        if (!activeAlgoRef.current || activeAlgoRef.current.isFinished) return;
        activeAlgoRef.current.step();
        updateVisuals();
        if (activeAlgoRef.current.isFinished) {
            handleFinish();
        }
    };

    return (
        <div className={`app-container ${pickingMode ? 'picking-mode' : ''}`}>
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
                activeAlgorithm={activeAlgorithm}
                setActiveAlgorithm={setActiveAlgorithm}
                onRunAlgorithm={handleRunAlgorithm}
                isAlgoRunning={isAlgoRunning}
                algoStats={algoStats}
                playbackSpeed={playbackSpeed}
                setPlaybackSpeed={setPlaybackSpeed}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
                onStepForward={handleStepForward}
                mapZoom={mapZoom} // NEW: Pass to Sidebar
            />
            <MapPane
                center={mapCenter}
                points={points}
                setPoints={setPoints}
                pickingMode={pickingMode}
                setPickingMode={setPickingMode}
                setMapBounds={setMapBounds}
                setMapZoom={setMapZoom} // NEW: Pass to MapPane
                graphLines={graphLines}
                finalPathCoords={finalPathCoords}
                visitedEdges={visitedEdges}
                frontierCoords={frontierCoords}
            />
        </div>
    );
}