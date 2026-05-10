export class PathfindingAlgorithm {
    constructor(graph, startNodeId, endNodeId) {
        this.graph = graph;
        this.startNodeId = startNodeId;
        this.endNodeId = endNodeId;

        this.cameFrom = new Map();
        this.visited = new Set();
        this.frontier = [];

        this.isFinished = false;
        this.path = [];

        this.stats = {
            nodesExplored: 0,
            maxFrontierSize: 0,
            executionTimeMs: 0,
            pathDistanceMeters: 0
        };

        this.startTime = null;
    }

    initialize() {
        this.cameFrom.clear();
        this.visited.clear();
        this.frontier = [];
        this.isFinished = false;
        this.path = [];
        this.stats = { nodesExplored: 0, maxFrontierSize: 0, executionTimeMs: 0, pathDistanceMeters: 0 };
        this.startTime = performance.now();
    }

    step() {
        throw new Error("step() must be implemented by subclass.");
    }

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

    reconstructPath(currentNodeId) {
        let totalDistance = 0;
        const path = [currentNodeId];
        let current = currentNodeId;

        while (this.cameFrom.has(current)) {
            const previous = this.cameFrom.get(current);

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

        path.reverse();

        this.path = path;
        this.stats.pathDistanceMeters = totalDistance;
        this.isFinished = true;
        this.stats.executionTimeMs = performance.now() - this.startTime;

        return this.path;
    }

    updateMaxFrontier(currentSize) {
        if (currentSize > this.stats.maxFrontierSize) {
            this.stats.maxFrontierSize = currentSize;
        }
    }

    finishWithoutPath() {
        this.isFinished = true;
        this.path = [];
        this.stats.executionTimeMs = performance.now() - this.startTime;
    }

    getFrontier() {
        return this.frontier;
    }
}