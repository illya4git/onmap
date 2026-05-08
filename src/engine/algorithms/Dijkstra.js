import { PathfindingAlgorithm } from './PathfindingAlgorithm';

/**
 * A lightweight Priority Queue for Dijkstra.
 * Enqueue is O(1). Dequeue is O(N) but uses a fast swap-and-pop technique.
 * For production grids, a Binary Min-Heap is faster, but this is perfect for UI visualizations.
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

        // Fast removal: swap the minimum element with the last element, then pop
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

        // Sync the visualization frontier with the priority queue's current elements
        this.frontier = this.pq.elements.map(item => item.element);
        this.updateMaxFrontier(this.frontier.length);

        return {
            type: 'STEP',
            current: currentId,
            frontier: [...this.frontier]
        };
    }
}