import * as THREE from "three"
import { loadAssets } from "./run/loadAssets";
import { showNoWebGLFallback } from "./ui/fallbacks";

export default class Engine {
    constructor(canvas, options = {}){
    // ----------------
        this.canvas = canvas;
        this.webGL = this.checkWebGLSupport();

    
    // ----------------

        this.config = {
            renderer: {
                antialias: options.renderer?.antialias ?? !(options.device?.isMobile ?? false),
                powerPreference: options.renderer?.powerPreference ?? 'high-performance',
                shadows: options.renderer?.shadows ?? true,
                clearColor: options.renderer?.clearColor ?? 0x000000,
                clearAlpha: options.renderer?.clearAlpha ?? 0,
                pixelRatio: options.renderer?.pixelRatio ?? Math.min(window.devicePixelRatio, 2),
            },
            engine: {
                maxDeltaTime: options.engine?.maxDeltaTime ?? 0.5,
            }
        }

    // ----------------

        this.mainCamera = null;
        this.renderer = null;
        this.assets = null;
        this.currentScene = null;
        this.currentWorld = null;
        this.inputSystem = null;

        this.lastTime = 0;
        this.isRunning = false;
        this.animationFrameId = null;


        this.resizeHandler = this.onWindowResize.bind(this);
        this.visibilityHandler = this.onWindowChange.bind(this);
    }

    async init(assets) {

        if (!this.webGL) {
            showNoWebGLFallback();
            return;
        }

        // ----------------
        try {
            this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            ...this.config.renderer
            });
        } catch (error) {
            console.error("Falha WebGLRenderer: ", error)
            showNoWebGLFallback();
            return;
        }

        // ----------------
        try {
            this.assets = await loadAssets(assets);
        } catch (error) {
            console.error("Erro em carregar os assets: ", error);
        }

    // ----------------

        this.renderer.setSize(window.innerWidth, window.innerHeight, false);
        this.renderer.setPixelRatio(this.config.renderer.pixelRatio);
        this.renderer.shadowMap.enabled = this.config.renderer.shadows;

        this.renderer.setClearColor(this.config.renderer.clearColor, this.config.renderer.clearAlpha);

    // ----------------       

        window.addEventListener("resize", this.resizeHandler);
        document.addEventListener("visibilitychange", this.visibilityHandler);

    // ----------------

        this.isRunning = true;
        this.lastTime = performance.now();
        this.mainLoop();
    }


    mainLoop = () => {
        if (!this.isRunning) return;

    // ----------------
        const now = performance.now();
        let deltaTime = (now - this.lastTime) / 1000;
        deltaTime = Math.min(deltaTime, this.config.engine.maxDeltaTime);

        this.lastTime = now;

    // ----------------
        if (this.currentWorld) {
            this.currentWorld.update(deltaTime);
        }

    // ----------------
        this.animationFrameId = requestAnimationFrame(this.mainLoop);
    }

// [=============================================================]
    onWindowResize(){

    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    } 

    onWindowChange(){
        console.log("visibility change");
        if (document.hidden) {
            this.isRunning = false;
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        } else {
            this.lastTime = performance.now(); 
            if (!this.isRunning) {
                this.isRunning = true;
                this.mainLoop();
            }
        }
    }
// [=============================================================]
    

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            // console.log("ok");
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

}