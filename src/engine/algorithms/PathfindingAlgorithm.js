export class PathfindingAlgorithm {
    constructor(graph, startNodeId, endNodeId) {
        this.graph = graph;
        this.startNodeId = startNodeId;
        this.endNodeId = endNodeId;

        // Standardized state for all algorithms
        this.cameFrom = new Map(); // Maps nodeId -> previous nodeId for path reconstruction
        this.visited = new Set();  // Nodes that have been fully evaluated
        this.frontier = [];        // Nodes waiting to be evaluated (queue, stack, or priority queue)

        this.isFinished = false;
        this.path = [];            // Final sequence of node IDs

        // Performance and Efficiency Metrics
        this.stats = {
            nodesExplored: 0,
            maxFrontierSize: 0,
            executionTimeMs: 0,
            pathDistanceMeters: 0
        };

        this.startTime = null;
    }

    /**
     * Resets the algorithm state and prepares data structures.
     * Must be overridden by subclasses to initialize their specific frontier.
     */
    initialize() {
        this.cameFrom.clear();
        this.visited.clear();
        this.frontier = [];
        this.isFinished = false;
        this.path = [];
        this.stats = { nodesExplored: 0, maxFrontierSize: 0, executionTimeMs: 0, pathDistanceMeters: 0 };
        this.startTime = performance.now();
    }

    /**
     * Executes a single iteration of the algorithm.
     * Must be overridden by subclasses.
     * @returns {Object} State update for UI visualization (e.g., current node, frontier state)
     */
    step() {
        throw new Error("step() must be implemented by subclass.");
    }

    /**
     * Runs the algorithm to completion synchronously.
     * Useful for performance benchmarking without UI rendering overhead.
     */
    run() {
        this.initialize();

        while (!this.isFinished) {
            this.step();
        }

        return {
            path: this.path,
            stats: this.stats
        };
    }

    /**
     * Standard backtracking to reconstruct the shortest path.
     * Call this inside `step()` when the target node is found.
     */
    reconstructPath(currentNodeId) {
        let totalDistance = 0;
        const path = [currentNodeId];
        let current = currentNodeId;

        while (this.cameFrom.has(current)) {
            const previous = this.cameFrom.get(current);

            // Look up the edge to add its weight to the total distance
            const prevGraphNode = this.graph.nodes.get(previous);
            if (prevGraphNode) {
                const edge = prevGraphNode.edges.find(e => e.targetNodeId === current);
                if (edge) {
                    totalDistance += edge.weight;
                }
            }

            current = previous;
            path.push(current);
        }

        path.reverse(); // Start to End

        this.path = path;
        this.stats.pathDistanceMeters = totalDistance;
        this.isFinished = true;
        this.stats.executionTimeMs = performance.now() - this.startTime;

        return this.path;
    }

    /**
     * Helper to track the maximum size of the frontier in memory.
     */
    updateMaxFrontier(currentSize) {
        if (currentSize > this.stats.maxFrontierSize) {
            this.stats.maxFrontierSize = currentSize;
        }
    }

    /**
     * Graceful termination when no path is found.
     */
    finishWithoutPath() {
        this.isFinished = true;
        this.path = [];
        this.stats.executionTimeMs = performance.now() - this.startTime;
    }

    getFrontier() {
        return this.frontier;
    }
}