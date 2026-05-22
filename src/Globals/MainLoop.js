export class MainLoop{
    constructor(world, maxDeltaTime = 0.5){

        this.currentWorld = world;

        this.maxDeltaTime = maxDeltaTime;
        this.lastTime = 0;
        this.isRunning = false;
        this.animationFrameId = null;

        
    }

    init(){
        this.isRunning = true;
        this.lastTime = performance.now();
        this._mainLoop();
    }

    _mainLoop = () => {
        if (!this.isRunning) return;

        

    // ----------------
        const now = performance.now();
        let deltaTime = (now - this.lastTime) / 1000;
        deltaTime = Math.min(deltaTime, this.maxDeltaTime);

        this.lastTime = now;

    // ----------------
        if (this.currentWorld) {
            this.currentWorld.update(deltaTime);
        }

    // ----------------
        this.animationFrameId = requestAnimationFrame(this._mainLoop);
        // console.log(deltaTime)
    }

    // [=============================================================]
    sleep() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    // ----------------
    wake() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            this._mainLoop();
        }
    }

    dispose(){
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.isRunning = false;
    }
}