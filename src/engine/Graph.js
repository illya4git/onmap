export class GraphEdge {
    constructor(targetNodeId, weight, isOneWay = false) {
        this.targetNodeId = targetNodeId;
        this.weight = weight; // Distance in meters
        this.isOneWay = isOneWay;
    }
}

export class GraphNode {
    constructor(id, lat, lon) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
        this.edges = []; // Adjacency list
    }

    addEdge(edge) {
        this.edges.push(edge);
    }
}

export class Graph {
    constructor() {
        this.nodes = new Map(); // Maps node ID to GraphNode
    }

    addNode(node) {
        if (!this.nodes.has(node.id)) {
            this.nodes.set(node.id, node);
        }
    }

    addEdge(fromId, toId, weight, isOneWay = false) {
        const fromNode = this.nodes.get(fromId);
        const toNode = this.nodes.get(toId);

        if (fromNode && toNode) {
            fromNode.addEdge(new GraphEdge(toId, weight, isOneWay));
            if (!isOneWay) {
                toNode.addEdge(new GraphEdge(fromId, weight, isOneWay));
            }
        }
    }

    clear() {
        this.nodes.clear();
    }
}