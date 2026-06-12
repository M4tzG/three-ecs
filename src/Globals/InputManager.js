export class InputManager{
    constructor(graphics){
        this.camera = graphics.camera;
        
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            dx: 0,
            dy: 0
        };
        this.actions = {
            'LEFT':  ['KeyA', 'ArrowLeft'],
            'RIGHT': ['KeyD', 'ArrowRight'],
            'JUMP':  ['Space', 'ArrowUp', 'KeyW'],
            'DOWN':  ['KeyS', 'ArrowDown']
        };

        this.gyro = { x: 0, y: 0 }
        this.keys = {};
        this.handlers = {};
    }
    init(){
        this.handlers.mousemove = (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.mouse.dx = e.movementX;
            this.mouse.dy = e.movementY;
        };
        
        // mouse
        this.handlers.mousedown = () => this.mouse.isDown = true;
        this.handlers.mouseup = () => this.mouse.isDown = false;

        // teclado
        this.handlers.keydown = (e) => { this.keys[e.code] = true; };
        this.handlers.keyup = (e) => { this.keys[e.code] = false; };


        window.addEventListener('keydown', this.handlers.keydown);
        window.addEventListener('keyup', this.handlers.keyup);

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
    isActionActive(actionName) {
        const mappedKeys = this.actions[actionName];
        if (!mappedKeys) return false;
        
        return mappedKeys.some(key => this.keys[key]); 
    }
    
    dispose() {
        console.log("input");
        window.removeEventListener('keydown', this.handlers.keydown);
        window.removeEventListener('keyup', this.handlers.keyup);
        window.removeEventListener('mousemove', this.handlers.mousemove);
        window.removeEventListener('mousedown', this.handlers.mousedown);
        window.removeEventListener('mouseup', this.handlers.mouseup);
        if (this.handlers.deviceorientation) {
            window.removeEventListener('deviceorientation', this.handlers.deviceorientation);
        }
    }
}