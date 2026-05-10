import MapPane from './components/Map/MapPane.jsx';
import Sidebar from './components/Sidebar/Sidebar.jsx';
import { useMapState } from './hooks/useMapState';
import { usePathfinder } from './hooks/usePathfinder';
import './App.css';

export default function App() {
    // 1. Initialize Map State
    const mapState = useMapState();

    // 2. Initialize Pathfinder Engine State (passing necessary map context)
    const pathfinder = usePathfinder(mapState.mapBounds, mapState.mapZoom, mapState.points);

    return (
        <div className={`app-container ${mapState.pickingMode ? 'picking-mode' : ''}`}>
            <Sidebar
                isOpen={mapState.isSidebarOpen}
                toggleSidebar={mapState.toggleSidebar}
                setMapCenter={mapState.setMapCenter}
                points={mapState.points}
                setPoints={mapState.setPoints}
                pickingMode={mapState.pickingMode}
                setPickingMode={mapState.setPickingMode}
                mapZoom={mapState.mapZoom}

                onLoadGraph={pathfinder.handleLoadGraph}
                onClearGraph={pathfinder.handleClearGraph}
                isGraphLoading={pathfinder.isGraphLoading}
                graphStats={pathfinder.graphStats}

                activeAlgorithm={pathfinder.activeAlgorithm}
                setActiveAlgorithm={pathfinder.setActiveAlgorithm}
                onRunAlgorithm={pathfinder.handleRunAlgorithm}
                isAlgoRunning={pathfinder.isAlgoRunning}
                algoStats={pathfinder.algoStats}

                playbackSpeed={pathfinder.playbackSpeed}
                setPlaybackSpeed={pathfinder.setPlaybackSpeed}
                isPaused={pathfinder.isPaused}
                setIsPaused={pathfinder.setIsPaused}
                onStepForward={pathfinder.handleStepForward}
            />
            <MapPane
                center={mapState.mapCenter}
                points={mapState.points}
                setPoints={mapState.setPoints}
                pickingMode={mapState.pickingMode}
                setPickingMode={mapState.setPickingMode}
                setMapBounds={mapState.setMapBounds}
                setMapZoom={mapState.setMapZoom}

                graphLines={pathfinder.graphLines}
                finalPathCoords={pathfinder.finalPathCoords}
                visitedEdges={pathfinder.visitedEdges}
                frontierCoords={pathfinder.frontierCoords}
            />
        </div>
    );
}