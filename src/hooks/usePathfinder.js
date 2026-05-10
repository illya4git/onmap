import { useState, useRef } from 'react';
import { PathfindingEngine } from '../engine/PathfindingEngine';
import { BreadthFirstSearch } from '../engine/algorithms/BFS';
import { Dijkstra } from '../engine/algorithms/Dijkstra';
import { AStar } from '../engine/algorithms/AStar';
import { AlgorithmRunner } from '../engine/AlgorithmRunner'; // Import the new runner

export function usePathfinder(mapBounds, mapZoom, points) {
    const engineRef = useRef(new PathfindingEngine());
    const runnerRef = useRef(null); // Keep track of the runner instead of the loop

    const [isGraphLoading, setIsGraphLoading] = useState(false);
    const [graphStats, setGraphStats] = useState(null);
    const [graphLines, setGraphLines] = useState(null);

    const [activeAlgorithm, setActiveAlgorithm] = useState('AStar');
    const [algoStats, setAlgoStats] = useState(null);
    const [isAlgoRunning, setIsAlgoRunning] = useState(false);
    const [finalPathCoords, setFinalPathCoords] = useState(null);

    const [playbackSpeed, setPlaybackSpeedState] = useState(50);
    const [isPaused, setIsPausedState] = useState(false);
    const [visitedEdges, setVisitedEdges] = useState(null);
    const [frontierCoords, setFrontierCoords] = useState(null);

    // NEW: Accumulators to prevent rebuilding arrays from scratch
    const accumulatedEdgesRef = useRef([]);
    const lastProcessedCameFromSize = useRef(0);

    const handleLoadGraph = async () => {
        if (!mapBounds) return;
        setIsGraphLoading(true);
        handleClearGraph();

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

        accumulatedEdgesRef.current = [];
        lastProcessedCameFromSize.current = 0;

        if (runnerRef.current) {
            runnerRef.current.stop();
            runnerRef.current = null;
        }
    };

    // Callback fired by the runner every frame
    const handleAlgorithmUpdate = (algo) => {
        let i = 0;
        let addedNewEdges = false;

        // 1. Only process NEW entries added to the cameFrom map since the last frame
        for (const [nodeId, parentId] of algo.cameFrom.entries()) {
            if (i >= lastProcessedCameFromSize.current) {
                const node = engineRef.current.graph.nodes.get(nodeId);
                const parent = engineRef.current.graph.nodes.get(parentId);
                if (node && parent) {
                    accumulatedEdgesRef.current.push([[parent.lat, parent.lon], [node.lat, node.lon]]);
                    addedNewEdges = true;
                }
            }
            i++;
        }

        lastProcessedCameFromSize.current = algo.cameFrom.size;

        // Only trigger a React state update if we actually found new edges
        if (addedNewEdges) {
            setVisitedEdges([...accumulatedEdgesRef.current]);
        }

        // 2. Fetch the frontier using our newly optimized method
        const fCoords = algo.getFrontier().map(id => {
            const n = engineRef.current.graph.nodes.get(id);
            return n ? [n.lat, n.lon] : null;
        }).filter(Boolean);

        setFrontierCoords(fCoords);
        setAlgoStats({...algo.stats});
    };

    // Callback fired by the runner when a path is found (or fails)
    const handleAlgorithmFinish = (algo) => {
        setIsAlgoRunning(false);
        setAlgoStats(algo.stats);

        if (algo.path.length > 0) {
            const coords = algo.path.map(id => {
                const n = engineRef.current.graph.nodes.get(id);
                return [n.lat, n.lon];
            });
            setFinalPathCoords(coords);
        } else {
            alert("No path found between these points!");
        }
    };

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

        // Initialize the new runner
        const runner = new AlgorithmRunner(algo, handleAlgorithmUpdate, handleAlgorithmFinish);
        runner.setSpeed(playbackSpeed);
        runnerRef.current = runner;

        setIsAlgoRunning(true);
        setIsPausedState(false);
        setFinalPathCoords(null);
        setVisitedEdges(null);
        setFrontierCoords(null);
        setAlgoStats(null);

        accumulatedEdgesRef.current = [];
        lastProcessedCameFromSize.current = 0;

        runner.start();
    };

    // Proxy functions to sync React state with the Runner
    const setPlaybackSpeed = (speed) => {
        setPlaybackSpeedState(speed);
        if (runnerRef.current) runnerRef.current.setSpeed(speed);
    };

    const setIsPaused = (paused) => {
        setIsPausedState(paused);
        if (runnerRef.current) {
            paused ? runnerRef.current.pause() : runnerRef.current.resume();
        }
    };

    const handleStepForward = () => {
        if (runnerRef.current) runnerRef.current.stepForward();
    };

    return {
        isGraphLoading, graphStats, graphLines,
        activeAlgorithm, setActiveAlgorithm,
        algoStats, isAlgoRunning, finalPathCoords,
        playbackSpeed, setPlaybackSpeed,
        isPaused, setIsPaused,
        visitedEdges, frontierCoords,
        handleLoadGraph, handleClearGraph,
        handleRunAlgorithm, handleStepForward
    };
}