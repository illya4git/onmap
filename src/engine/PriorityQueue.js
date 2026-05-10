export class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.bubbleUp(this.elements.length - 1);
    }

    dequeue() {
        if (this.isEmpty()) return null;

        // The minimum element is always at the root (index 0)
        const min = this.elements[0];
        const end = this.elements.pop();

        if (this.elements.length > 0) {
            this.elements[0] = end;
            this.sinkDown(0);
        }

        return min.element;
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    bubbleUp(n) {
        const element = this.elements[n];
        while (n > 0) {
            const parentN = Math.floor((n - 1) / 2);
            const parent = this.elements[parentN];

            if (element.priority >= parent.priority) break;

            this.elements[parentN] = element;
            this.elements[n] = parent;
            n = parentN;
        }
    }

    sinkDown(n) {
        const length = this.elements.length;
        const element = this.elements[n];

        while (true) {
            const leftChildIdx = 2 * n + 1;
            const rightChildIdx = 2 * n + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIdx < length) {
                leftChild = this.elements[leftChildIdx];
                if (leftChild.priority < element.priority) {
                    swap = leftChildIdx;
                }
            }

            if (rightChildIdx < length) {
                rightChild = this.elements[rightChildIdx];
                if (
                    (swap === null && rightChild.priority < element.priority) ||
                    (swap !== null && rightChild.priority < leftChild.priority)
                ) {
                    swap = rightChildIdx;
                }
            }

            if (swap === null) break;

            this.elements[n] = this.elements[swap];
            this.elements[swap] = element;
            n = swap;
        }
    }
}