import './Controls.css';

export default function GraphControls({
                                          mapZoom,
                                          graphStats,
                                          onLoadGraph,
                                          onClearGraph,
                                          isGraphLoading
                                      }) {
    return (
        <div className="control-group">
            <h3>Network Graph</h3>
            {!graphStats ? (
                <>
                    <p className="lod-readout">
                        <strong>Zoom: {mapZoom}</strong><br/>
                        {mapZoom <= 12 && "LOD: Motorways & Trunks Only"}
                        {mapZoom > 12 && mapZoom <= 14 && "LOD: Up to Secondary Roads"}
                        {mapZoom > 14 && mapZoom <= 16 && "LOD: Up to Residential Roads"}
                        {mapZoom > 16 && "LOD: All drivable roads"}
                    </p>

                    <button
                        className="btn-load-graph"
                        onClick={onLoadGraph}
                        disabled={isGraphLoading || mapZoom < 8}
                    >
                        {isGraphLoading ? 'Downloading & Parsing...' : (mapZoom < 8 ? 'Zoom in closer to load graph' : 'Load Area into Engine')}
                    </button>
                </>
            ) : (
                <>
                    <p className="graph-ready-text">
                        Graph ready! Nodes: {graphStats.nodes}
                    </p>
                    <button
                        className="btn-clear-graph"
                        onClick={onClearGraph}
                    >
                        Clear Graph & Show Map
                    </button>
                </>
            )}
        </div>
    );
}