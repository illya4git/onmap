export class AlgorithmRunner {
    constructor(algorithm, onUpdate, onFinish) {
        this.algorithm = algorithm;
        this.onUpdate = onUpdate; // Callback for when a frame finishes
        this.onFinish = onFinish; // Callback for when the path is found

        this.playbackSpeed = 50;
        this.isPaused = false;
        this.rafId = null;
    }

    start() {
        this.isPaused = false;
        this.stop(); // Ensure no duplicate loops
        this.loop();
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
        if (!this.rafId && !this.algorithm.isFinished) {
            this.loop();
        }
    }

    setSpeed(speed) {
        this.playbackSpeed = speed;
    }

    stepForward() {
        if (this.algorithm.isFinished) return;

        this.algorithm.step();
        this.onUpdate(this.algorithm);

        if (this.algorithm.isFinished) {
            this.stop();
            this.onFinish(this.algorithm);
        }
    }

    stop() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    // Arrow function preserves 'this' context
    loop = () => {
        if (this.isPaused || this.algorithm.isFinished) {
            this.stop();
            return;
        }

        // Process a batch of steps per frame based on speed
        for (let i = 0; i < this.playbackSpeed; i++) {
            this.algorithm.step();
            if (this.algorithm.isFinished) break;
        }

        // Emit an update to React after the batch
        this.onUpdate(this.algorithm);

        // Check if we hit the end during this batch
        if (this.algorithm.isFinished) {
            this.stop();
            this.onFinish(this.algorithm);
        } else {
            this.rafId = requestAnimationFrame(this.loop);
        }
    }
}