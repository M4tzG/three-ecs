import * as THREE from "three"
import {
    InputManager,
    MainLoop, 
    AssetsManager,
    CanvasManager,
    GraphicsManager
} from "./Globals/index"


import { World } from "./ecs/World"
import { runScene } from "./run/runScene";

export default class Engine{
    constructor(canvas, options = {}){

        this.currentScene = null;
        this.currentWorld = null;

        const isMobile = options.device?.isMobile ?? false;
        const rOpts = options.renderer || {};
    
        // ----------------    
        this.configs = {
            renderer: {
                antialias: rOpts.antialias ?? !isMobile,
                powerPreference: rOpts.powerPreference ?? 'high-performance',
                shadows: rOpts.shadows ?? true,
                clearColor: rOpts.clearColor ?? 0x000000,
                clearAlpha: rOpts.clearAlpha ?? 0,
                pixelRatio: rOpts.pixelRatio ?? Math.min(window.devicePixelRatio, 2),
            }
        };

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

    initScene(data, setupSystemsCallback){

        this.clearCurrentState();

        this.currentScene = new THREE.Scene();
        this.currentWorld = new World();
        this.mainLoop.currentWorld = this.currentWorld

        // ----------------
        this.graphics.setup(data, this.currentScene);
        
        // ----------------

        if (setupSystemsCallback) {
            setupSystemsCallback(this.currentWorld, this.currentScene, {
                inputManager: this.inputManager,
                graphics: this.graphics
            });
            console.log("setupSystemsCallback")
        }
        // this.currentWorld.addSystem(new PlayerControlSystem(this.inputManager));
        // this.currentWorld.addSystem(new PhysicSystem());
        // this.currentWorld.addSystem(new VerletPhysicsSystem());
        // this.currentWorld.addSystem(new ConstraintSystem());  
        // this.currentWorld.addSystem(new ChainInteractionSystem(this.inputManager, this.graphics)); 
        // this.currentWorld.addSystem(new ChainRenderSystem());
        // this.currentWorld.addSystem(new CollisionSystem(this.inputManager, this.currentScene));
    
        // this.currentWorld.addSystem(new EffectSystem(this.currentScene, this.inputManager));
        // this.currentWorld.addSystem(new RenderSystem(this.currentScene, this.graphics));
        // this.currentWorld.addSystem(new DestroySystem(this.currentScene))
        // console.log(this.currentWorld.systems)
        runScene(this.currentWorld, this.currentScene, this.assets, data);

    }

    clearCurrentState() {
        if (this.currentScene) {
            this.currentScene.clear();
        }
        if (this.currentWorld) {
            this.currentWorld.dispose();
            this.currentWorld = null; 
        }
    }

    sleep(){
        this.mainLoop.sleep();
    }
    wake(){
        this.mainLoop.wake();
    }
    
    dispose(){

        this.clearCurrentState();

        this.mainLoop.dispose();
        this.canvas.dispose();
        this.assets.dispose();
        this.inputManager.dispose();
        this.graphics.dispose();
    }


}