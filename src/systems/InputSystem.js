import { Input } from "../components/Input";

import { System } from "../ecs/System"; 
import { Query } from "../ecs/Query";   


export class InputSystem extends System {
    
// [=============================================================]   
    // pega os inputs do mouse, um delta para interaçao e click
// [=============================================================]   

    constructor(camera) {
        super();
        this.camera = camera;
        
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            dx: 0,
            dy: 0
        };
        this.gyro = { x: 0, y: 0 }
        this.handlers = {};

        this.initListeners();
    }
    initListeners() {
        this.handlers.mousemove = (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.mouse.dx = e.movementX;
            this.mouse.dy = e.movementY;
        };

        this.handlers.mousedown = () => this.mouse.isDown = true;
        this.handlers.mouseup = () => this.mouse.isDown = false;

        window.addEventListener('mousemove', this.handlers.mousemove);
        window.addEventListener('mousedown', this.handlers.mousedown);
        window.addEventListener('mouseup', this.handlers.mouseup);

        
    }

    startDeviceOrientation() {
        if (this.handlers.deviceorientation) return;

        this.handlers.deviceorientation = (e) => {
            let gamma = e.gamma || 0; // Esquerda/Direita (-90 a 90)
            let beta = e.beta || 0;   // Frente/Trás (-180 a 180)

            let normX = Math.max(-1, Math.min(1, gamma / 45));
            let normY = Math.max(-1, Math.min(1, (beta - 45) / 45));

            this.gyro.x = normX;
            this.gyro.y = -normY;
        };

        window.addEventListener('deviceorientation', this.handlers.deviceorientation);
    }

    dispose() {
        window.removeEventListener('mousemove', this.handlers.mousemove);
        window.removeEventListener('mousedown', this.handlers.mousedown);
        window.removeEventListener('mouseup', this.handlers.mouseup);
        if (this.handlers.deviceorientation) {
            window.removeEventListener('deviceorientation', this.handlers.deviceorientation);
        }
    }

    update(world, deltaTime) {

        const entities = Query.entitiesWith(world, Input);

        for (const e of entities) {
            const input = world.getComponent(e, Input);

            input.mouse.x = this.mouse.x;
            input.mouse.y = this.mouse.y;
            input.mouse.deltaX = this.mouse.dx;
            input.mouse.deltaY = this.mouse.dy;
            input.mouse.isDown = this.mouse.isDown;

            // console.log(input.mouse.deltaX, input.mouse.deltaY)
            input.gyro.x = this.gyro.x;
            input.gyro.y = this.gyro.y;
        }
    }
}