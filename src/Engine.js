import * as THREE from "three"
import {
    InputManager,
    MainLoop, 
    AssetsManager,
    CanvasManager,
    GraphicsManager
} from "./Globals/index"

import {
    RenderSystem,
    EffectSystem,
    CollisionSystem,
    PhysicSystem
} from "./systems/index"

import { World } from "./ecs/World"
import { runScene } from "./run/runScene";

export default class Engine{
    constructor(canvas, options = {}){

        this.currentScene = null;
        this.currentWorld = null;
    
    // ----------------    
        this.configs = {

            renderer: {
                antialias: options.renderer?.antialias ?? !(options.device?.isMobile ?? false),
                powerPreference: options.renderer?.powerPreference ?? 'high-performance',
                shadows: options.renderer?.shadows ?? true,
                clearColor: options.renderer?.clearColor ?? 0x000000,
                clearAlpha: options.renderer?.clearAlpha ?? 0,
                pixelRatio: options.renderer?.pixelRatio ?? Math.min(window.devicePixelRatio, 2),
            },
            camera: {
                type: options.camera?.type ?? 'perspective',
                fov: options.camera?.fov ?? 75,
                near: options.camera?.near ?? 0.1,
                far: options.camera?.far ?? 1000,
                positionZ: options.camera?.positionZ ?? 5
            },
            postProcessing: {
                pincushion: { 
                    active: options.postProcessing?.pincushion.active ?? true, 
                    strength: options.postProcessing?.pincushion.active ?? 0.15 },
                crt: { 
                    active: options.postProcessing?.crt.active ?? true, 
                    scanlineIntensity: options.postProcessing?.crt.scanlineIntensity ?? 0.08, 
                    scanlineCount: options.postProcessing?.crt.scanlineCount ?? 800.0, 
                    vignetteDarkness: options.postProcessing?.crt.vignetteDarkness ?? 1.0, 
                    aberrationAmount: options.postProcessing?.crt.aberrationAmount ?? 0.01 
                }
            }
        }

        // ----------------

        this.canvas = new CanvasManager(canvas); 
        
        this.mainLoop = new MainLoop();
        this.assets = new AssetsManager();
        this.graphics = new GraphicsManager(this.canvas, this.configs);
        this.inputManager = new InputManager(this.graphics);

        
    }

    async init(assets){
        try {
            await this.assets.loadAssets(assets);
        } catch (error) {
            console.error("Erro nos assets: ", error);
        }
        this.inputManager.init();
        this.graphics.init();
        this.canvas.init();
        this.mainLoop.init();

    }

    initScene(data){

        if (this.currentScene) {
            this.currentScene.clear();
        }
        if (this.currentWorld) { // inputSystem -> windowListener acumula
            this.currentWorld.dispose();
            this.currentWorld = null; 
        }

// ----------------
        this.currentScene = new THREE.Scene();
        this.currentWorld = new World();
        this.mainLoop.currentWorld = this.currentWorld

        this.graphics.initPostProcessing(this.currentScene)
        
        this.currentWorld.addSystem(new PhysicSystem());
        this.currentWorld.addSystem(new CollisionSystem(this.inputManager, this.currentScene));
        this.currentWorld.addSystem(new EffectSystem(this.currentScene, this.inputManager));
        this.currentWorld.addSystem(new RenderSystem(this.currentScene, this.graphics));
        
        // console.log(this.currentWorld.systems)
        runScene(this.currentWorld, this.currentScene, this.assets, data);

    }

    sleep(){
        this.mainLoop.sleep();
    }
    wake(){
        this.mainLoop.wake();
    }
    
    dispose(){

        if (this.currentWorld) {
            this.currentWorld.dispose();
        }

        if (this.currentScene) {
            this.currentScene.clear();
        }
        this.mainLoop.dispose();
        this.canvas.dispose();
        this.assets.dispose();
        this.inputManager.dispose();
        this.graphics.dispose();
    }


}