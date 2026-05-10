import { PriorityQueue } from "../PriorityQueue.js";
import { PathfindingAlgorithm } from './PathfindingAlgorithm';

export class Dijkstra extends PathfindingAlgorithm {
    initialize() {
        super.initialize();

        this.pq = new PriorityQueue();
        this.pq.enqueue(this.startNodeId, 0);

        this.costSoFar = new Map();
        this.costSoFar.set(this.startNodeId, 0);

        this.frontier = [this.startNodeId];
    }

    step() {
        if (this.isFinished) return null;

        if (this.pq.isEmpty()) {
            this.finishWithoutPath();
            return { type: 'NO_PATH', stats: this.stats };
        }

        const currentId = this.pq.dequeue();
        this.stats.nodesExplored++;

        this.visited.add(currentId);

        if (currentId === this.endNodeId) {
            this.reconstructPath(currentId);
            return { type: 'PATH_FOUND', path: this.path, stats: this.stats };
        }

        const node = this.graph.nodes.get(currentId);

        if (node) {
            for (const edge of node.edges) {
                const neighborId = edge.targetNodeId;

                const newCost = this.costSoFar.get(currentId) + edge.weight;

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
        return this.pq.elements.map(item => item.element);
    }
}