import { PathfindingAlgorithm } from './PathfindingAlgorithm';

export class BreadthFirstSearch extends PathfindingAlgorithm {
    initialize() {
        super.initialize();

        // BFS uses a Queue (First-In, First-Out).
        // In standard JS, we use an array with push() and shift().
        this.frontier = [this.startNodeId];

        // Mark the start node as visited immediately so we don't process it twice
        this.visited.add(this.startNodeId);
    }

    step() {
        // Prevent running after completion
        if (this.isFinished) return null;

        // If the queue is empty and we haven't found the target, no path exists.
        if (this.frontier.length === 0) {
            this.finishWithoutPath();
            return { type: 'NO_PATH', stats: this.stats };
        }

        // 1. Dequeue the next node to explore
        const currentId = this.frontier.shift();
        this.stats.nodesExplored++;

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

                // In BFS, we mark as visited when *adding* to the queue
                // to prevent adding the same neighbor multiple times
                if (!this.visited.has(neighborId)) {
                    this.visited.add(neighborId);
                    this.cameFrom.set(neighborId, currentId);
                    this.frontier.push(neighborId);
                }
            }
        }

        // Update performance metric
        this.updateMaxFrontier(this.frontier.length);

        // Return the current state for React visualization
        return {
            type: 'STEP',
            current: currentId,
            // We clone the frontier array to avoid React reference mutability issues
            frontier: [...this.frontier]
        };
    }
}