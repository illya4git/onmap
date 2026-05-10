import { PathfindingAlgorithm } from './PathfindingAlgorithm';

export class BreadthFirstSearch extends PathfindingAlgorithm {
    initialize() {
        super.initialize();

        this.frontier = [this.startNodeId];
        this.visited.add(this.startNodeId);
    }

    step() {
        if (this.isFinished) return null;

        if (this.frontier.length === 0) {
            this.finishWithoutPath();
            return { type: 'NO_PATH', stats: this.stats };
        }

        const currentId = this.frontier.shift();
        this.stats.nodesExplored++;

        if (currentId === this.endNodeId) {
            this.reconstructPath(currentId);
            return { type: 'PATH_FOUND', path: this.path, stats: this.stats };
        }

        const node = this.graph.nodes.get(currentId);

        if (node) {
            for (const edge of node.edges) {
                const neighborId = edge.targetNodeId;

                if (!this.visited.has(neighborId)) {
                    this.visited.add(neighborId);
                    this.cameFrom.set(neighborId, currentId);
                    this.frontier.push(neighborId);
                }
            }
        }

        this.updateMaxFrontier(this.frontier.length);

        return {
            type: 'STEP',
            current: currentId,
            frontier: [...this.frontier]
        };
    }
}