import * as THREE from "three";
import Engine from "../src/Engine.js";

import {
    RenderSystem,
    EffectSystem,
    CollisionSystem,
    PhysicSystem,
    PlayerControlSystem,
    ChainRenderSystem,
    ConstraintSystem,
    VerletPhysicsSystem,
    ChainInteractionSystem,
    DestroySystem
} from "../src/systems/index"


const canvas = document.getElementById("app")
const configs = {

};
const engine = new Engine(canvas, configs);

// engine.init();

const assets = [
    ["kitty", "/assets/kitty.png"],
    ["imageTop", "/assets/chainTop.png"],
    ["imageBottom", "/assets/chainBotton.png"],
    ["imageFull", "/assets/chainFull.png"]
]
await engine.init(assets)

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

const data = {
    // camera: {
    //     type: 'orthographic', // ou 'orthographic'
    //     fov: 75,
    //     near: 0.1,
    //     far: 1000,
    //     positionZ: 5
    // },
    postProcessing: {
        pincushion: { active: true, strength: 0.2 },
        crt: { 
            active: false, 
            scanlineIntensity: 0.08, 
            scanlineCount: 800.0, 
            vignetteDarkness: 1.0, 
            aberrationAmount: 0.01 
        }
    },
    player: [
        {
            imageName: "kitty",
            collision: true,
            transform: { px: 0, py: 5, pz: 0, scale: 5},
            mouseInteraction: { isParallaxed: false, isHoverable: false, parallaxFactor: -0.2, isDraggable: false },
            rigidBody: { bodyType: "dynamic", mass: 1, velocity: v3(0,1,0)},
            controller: {speed: 3, jumpForce: 2}
        },
    ],

    sprites: [
        {
            imageName: "kitty",
            collision: true,
            transform: { px: 0, py: -2, pz: 0, scale: 5},
            mouseInteraction: { isParallaxed: true, isHoverable: false, parallaxFactor: -0.2, isDraggable: false },
            rigidBody: { bodyType: "static"}
        },
        // {ada
        //     imageName: "kitty",
        //     collision: true,
        //     transform: { px: 0, py: 5, pz: 0, scale: 5},
        //     mouseInteraction: { isParallaxed: false, isHoverable: false, parallaxFactor: -0.2, isDraggable: false },
        //     rigidBody: { bodyType: "dynamic", mass: 1, velocity: v3(0,1,0)}
        // }
    ],
    verlet: [
        {
            baseHeight: 0.5,
            chainConfig: {
                startPos: new THREE.Vector3(0, 3, 0),
                endPos:   new THREE.Vector3(1, -4, 0),
                isPinnedEnd: false,
                numLinks: 10,
                scale: 3,
            }
        }
    ]
    // exemple:[]
}

engine.initScene(data, (world, scene, engineRefs) => {

    world.addSystem(new PlayerControlSystem(engineRefs.inputManager));
    world.addSystem(new PhysicSystem());
    world.addSystem(new VerletPhysicsSystem());
    world.addSystem(new ConstraintSystem());  
    world.addSystem(new ChainInteractionSystem(engineRefs.inputManager, engineRefs.graphics)); 
    world.addSystem(new ChainRenderSystem());
    world.addSystem(new CollisionSystem(engineRefs.inputManager, scene));

    world.addSystem(new EffectSystem(scene, engineRefs.inputManager));
    world.addSystem(new RenderSystem(scene, engineRefs.graphics));
    world.addSystem(new DestroySystem(scene))
    
});


document.getElementById("botao").addEventListener("click", function() {
  engine.sleep();
});

document.getElementById("botao2").addEventListener("click", function() {
  engine.dispose();
});