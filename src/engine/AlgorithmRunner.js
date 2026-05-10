export class AlgorithmRunner {
    constructor(algorithm, onUpdate, onFinish) {
        this.algorithm = algorithm;
        this.onUpdate = onUpdate;
        this.onFinish = onFinish;

        this.playbackSpeed = 50;
        this.isPaused = false;
        this.rafId = null;
    }

    start() {
        this.isPaused = false;
        this.stop();
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

    loop = () => {
        if (this.isPaused || this.algorithm.isFinished) {
            this.stop();
            return;
        }

        for (let i = 0; i < this.playbackSpeed; i++) {
            this.algorithm.step();
            if (this.algorithm.isFinished) break;
        }

        this.onUpdate(this.algorithm);

        if (this.algorithm.isFinished) {
            this.stop();
            this.onFinish(this.algorithm);
        } else {
            this.rafId = requestAnimationFrame(this.loop);
        }
    }
}