import { PriorityQueue } from "../PriorityQueue.js";
import { PathfindingAlgorithm } from './PathfindingAlgorithm';

export class Dijkstra extends PathfindingAlgorithm {
    initialize() {
        super.initialize();

        this.pq = new PriorityQueue();
        this.pq.enqueue(this.startNodeId, 0);

        // Maps nodeId -> the lowest total distance found so far from the start
        this.costSoFar = new Map();
        this.costSoFar.set(this.startNodeId, 0);

        // Keep the base class 'frontier' array updated purely for the React UI to visualize
        this.frontier = [this.startNodeId];
    }

    step() {
        if (this.isFinished) return null;

        if (this.pq.isEmpty()) {
            this.finishWithoutPath();
            return { type: 'NO_PATH', stats: this.stats };
        }

        // 1. Extract the node with the lowest accumulated cost
        const currentId = this.pq.dequeue();
        this.stats.nodesExplored++;

        // Mark as fully evaluated
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

                // The cost to get to this neighbor is the cost to get to the current node + the edge length
                const newCost = this.costSoFar.get(currentId) + edge.weight;

                // If we've never reached this neighbor, or we found a shorter route to it
                if (!this.costSoFar.has(neighborId) || newCost < this.costSoFar.get(neighborId)) {
                    this.costSoFar.set(neighborId, newCost);
                    this.cameFrom.set(neighborId, currentId);
                    this.pq.enqueue(neighborId, newCost);
                }
            }
        }

        this.updateMaxFrontier(this.pq.elements.length);

        return {
            type: 'STEP',
            current: currentId,
            frontier: [...this.frontier]
        };
    }

    getFrontier() {
        // Only run this O(N) map operation when the UI explicitly asks for it
        return this.pq.elements.map(item => item.element);
    }
}