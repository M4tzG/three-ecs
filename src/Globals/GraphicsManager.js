import * as THREE from "three"
export class GraphicsManager {
    constructor(canvas, configs){
        this.camera = this.createCamera();
        this.canvas = canvas;
        this.width = this.canvas.getWidth();
        this.height = this.canvas.getHeight();
        this.configs = configs;
        this.renderer = null;
    }
    init(){
 
        try {
            this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas.canvas,
            ...this.configs.renderer
            });
        } catch (error) {
            console.error("falha WebGLRenderer: ", error)
            return;
        }

        this.renderer.setSize(this.width, this.height, false);
        this.renderer.setPixelRatio(this.configs.renderer.pixelRatio);
        this.renderer.shadowMap.enabled = this.configs.renderer.shadows;

        this.renderer.setClearColor(this.configs.renderer.clearColor, this.configs.renderer.clearAlpha);
    }

    createCamera(){

        const camera = new THREE.PerspectiveCamera(
            75, // fov
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        camera.position.z = 5;
        return camera 
    }

    //   // teste apenas
    draw(scene){
        this.renderer.render(scene, this.camera);
    }

}