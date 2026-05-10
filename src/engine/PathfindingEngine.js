import { Graph, GraphNode } from './Graph';

export class PathfindingEngine {
    constructor() {
        this.graph = new Graph();
    }

    async loadGraphFromBounds(bounds, zoomLevel = 15) {
        const { _southWest, _northEast } = bounds;

        let highwayFilter;
        if (zoomLevel <= 12) {
            // Very zoomed out: Only the absolute biggest highways
            highwayFilter = '["highway"~"motorway|trunk"]';
        } else if (zoomLevel <= 14) {
            // City view: Include primary and secondary arteries
            highwayFilter = '["highway"~"motorway|trunk|primary|secondary"]';
        } else if (zoomLevel <= 16) {
            // Neighborhood view: Include tertiary and residential
            highwayFilter = '["highway"~"motorway|trunk|primary|secondary|tertiary|unclassified|residential"]';
        } else {
            // Street level (17+): All drivable roads
            highwayFilter = '["highway"]["highway"!~"pedestrian|footway|path|steps|track|cycleway"]';
        }

        const query = `
            [out:json][timeout:25];
            (
              way${highwayFilter}(${_southWest.lat},${_southWest.lng},${_northEast.lat},${_northEast.lng});
            );
            (._;>;);
            out body;
        `;

        const url = `https://overpass-api.de/api/interpreter`;

        try {
            const response = await fetch(url, {
                method: "POST",
                body: query
            });
            const data = await response.json();
            this.parseOSMData(data.elements);

            return {
                nodes: this.graph.nodes.size,
                success: true
            };
        } catch (error) {
            console.error("Failed to load map data:", error);
            return { success: false, error: error.message };
        }
    }

    parseOSMData(elements) {
        this.graph.clear();

        const ways = [];

        for (const el of elements) {
            if (el.type === 'node') {
                this.graph.addNode(new GraphNode(el.id, el.lat, el.lon));
            } else if (el.type === 'way') {
                ways.push(el);
            }
        }

        for (const way of ways) {
            const nodeIds = way.nodes;
            const isOneWay = way.tags && (way.tags.oneway === 'yes' || way.tags.oneway === '1');

            for (let i = 0; i < nodeIds.length - 1; i++) {
                const idA = nodeIds[i];
                const idB = nodeIds[i + 1];

                const nodeA = this.graph.nodes.get(idA);
                const nodeB = this.graph.nodes.get(idB);

                if (nodeA && nodeB) {
                    const distance = this.calculateHaversineDistance(nodeA.lat, nodeA.lon, nodeB.lat, nodeB.lon);
                    this.graph.addEdge(idA, idB, distance, isOneWay);
                }
            }
        }

        console.log(`Graph parsed with ${this.graph.nodes.size} nodes.`);
    }

    calculateHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    getRenderableEdges() {
        const lines = [];
        const drawn = new Set();

        for (const [nodeId, node] of this.graph.nodes.entries()) {
            for (const edge of node.edges) {
                const targetNode = this.graph.nodes.get(edge.targetNodeId);
                if (targetNode) {
                    const edgeKey = [nodeId, targetNode.id].sort().join('-');
                    if (!drawn.has(edgeKey)) {
                        lines.push([
                            [node.lat, node.lon],
                            [targetNode.lat, targetNode.lon]
                        ]);
                        drawn.add(edgeKey);
                    }
                }
            }
        }
        return lines;
    }

    getClosestNodeId(lat, lon) {
        let minDistance = Infinity;
        let closestNodeId = null;

        for (const [id, node] of this.graph.nodes.entries()) {
            const distance = this.calculateHaversineDistance(lat, lon, node.lat, node.lon);
            if (distance < minDistance) {
                minDistance = distance;
                closestNodeId = id;
            }
        }

        return closestNodeId;
    }

    clearGraph() {
        this.graph.clear();
    }
}