import { PathfindingAlgorithm } from './PathfindingAlgorithm';

/**
 * Reusing the lightweight Priority Queue from Dijkstra.
 * (In a production app, you might want to extract this into a shared utils file!)
 */
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
    }

    dequeue() {
        if (this.isEmpty()) return null;

        let minIndex = 0;
        for (let i = 1; i < this.elements.length; i++) {
            if (this.elements[i].priority < this.elements[minIndex].priority) {
                minIndex = i;
            }
        }

        const item = this.elements[minIndex];
        const last = this.elements.pop();
        if (minIndex < this.elements.length) {
            this.elements[minIndex] = last;
        }

        return item.element;
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

export class AStar extends PathfindingAlgorithm {
    initialize() {
        super.initialize();

        this.pq = new PriorityQueue();

        // gScore: The exact distance from the start node to the current node
        this.gScore = new Map();
        this.gScore.set(this.startNodeId, 0);

        // fScore: gScore + heuristic (estimated total distance to the end)
        // We prioritize the queue based on the lowest fScore.
        this.fScore = new Map();
        const startHeuristic = this.heuristic(this.startNodeId, this.endNodeId);
        this.fScore.set(this.startNodeId, startHeuristic);

        this.pq.enqueue(this.startNodeId, startHeuristic);

        this.frontier = [this.startNodeId];
    }

    step() {
        if (this.isFinished) return null;

        if (this.pq.isEmpty()) {
            this.finishWithoutPath();
            return { type: 'NO_PATH', stats: this.stats };
        }

        // 1. Extract the node with the lowest estimated total cost (fScore)
        const currentId = this.pq.dequeue();
        this.stats.nodesExplored++;

        this.visited.add(currentId);

        // 2. Check victory condition
        if (currentId === this.endNodeId) {
            this.reconstructPath(currentId);
            return { type: 'PATH_FOUND', path: this.path, stats: this.stats };
        }

        // 3. Process neighbors
        const node = this.graph.nodes.get(currentId);

        if (node) {
            for (const edge of node.edges) {
                const neighborId = edge.targetNodeId;

                // The known distance to reach this neighbor
                const tentativeGScore = this.gScore.get(currentId) + edge.weight;

                // If we found a faster way to this neighbor
                if (!this.gScore.has(neighborId) || tentativeGScore < this.gScore.get(neighborId)) {

                    this.cameFrom.set(neighborId, currentId);
                    this.gScore.set(neighborId, tentativeGScore);

                    // fScore = precise distance from start + estimated distance to end
                    const fScore = tentativeGScore + this.heuristic(neighborId, this.endNodeId);
                    this.fScore.set(neighborId, fScore);

                    this.pq.enqueue(neighborId, fScore);
                }
            }
        }

        this.frontier = this.pq.elements.map(item => item.element);
        this.updateMaxFrontier(this.frontier.length);

        return {
            type: 'STEP',
            current: currentId,
            frontier: [...this.frontier]
        };
    }

    /**
     * The Heuristic Function: Straight-line Haversine distance to the target.
     * To be optimal, a heuristic MUST be "admissible" (it can never overestimate the real distance).
     * Since the shortest path between two points on Earth is a straight line, Haversine is perfect.
     */
    heuristic(nodeAId, nodeBId) {
        const nodeA = this.graph.nodes.get(nodeAId);
        const nodeB = this.graph.nodes.get(nodeBId);

        if (!nodeA || !nodeB) return 0;

        const R = 6371e3; // Earth radius in meters
        const lat1 = nodeA.lat * Math.PI / 180;
        const lat2 = nodeB.lat * Math.PI / 180;
        const deltaLat = (nodeB.lat - nodeA.lat) * Math.PI / 180;
        const deltaLon = (nodeB.lon - nodeA.lon) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}