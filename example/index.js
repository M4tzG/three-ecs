import * as THREE from "three";
import Engine from "../src/Engine.js";


const canvas = document.getElementById("app")

const engine = new Engine(canvas);

// engine.init();

await engine.init([
    ["kitty", "/assets/kitty.png"]
]);

// engine.initScene();


const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

const data = {
    // camera: [
    //     {
    //         type: "perspective",
    //         fov: 75,
    //         aspect: 2,
    //         near: 0.1,
    //         far: 1000,
    //         transform: { px: 0, py: 0, pz: 10 },
    //         lookAt: v3(0, 0, 0),
    //     }
    // ],
    // postProcessing: {
    //     pincushion: { 
    //         active: true, 
    //         strength: -0.4
    //     },
    //     crt: {
    //         active: true,
    //         scanlineIntensity: 0.08,
    //         scanlineCount: 800.0,
    //         vignetteDarkness: 0.1,
    //         aberrationAmount: 0.003,
    //     }
    // },
    sprites: [
        {
            imageName: "kitty",
            collision: true,
            transform: { px: 0, py: 0, pz: 0, scale: 5},
            mouseInteraction: { isParallaxed: false, isHoverable: false, parallaxFactor: -0.2, isDraggable: false },
            rigidBody: { bodyType: "static"}
            // transition: { velocity: 2, acceleration: 1.1, direction: { x: 0, y: -1 }, delay: 1.5  },
        },
        {
            imageName: "kitty",
            collision: true,
            transform: { px: 0, py: 5, pz: 0, scale: 5},
            mouseInteraction: { isParallaxed: false, isHoverable: false, parallaxFactor: -0.2, isDraggable: false },
            rigidBody: { bodyType: "dynamic", mass: 1, velocity: v3(0,1,0)}
            // transition: { velocity: 2, acceleration: 1.1, direction: { x: 0, y: -1 }, delay: 1.5  },
        }
    ]
    // exemple:[]
}

engine.initScene(data);


document.getElementById("botao").addEventListener("click", function() {
  engine.sleep();
});

document.getElementById("botao2").addEventListener("click", function() {
  engine.wake();
});