import * as THREE from "three"
import { SHADERS } from "../constants/Shaders";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export class GraphicsManager {
    constructor(canvas, configs){
        

        this.canvas = canvas;
        this.width = this.canvas.getWidth();
        this.height = this.canvas.getHeight();

        
        this.renderer = null;
        this.composer = null;
        
        // console.log(configs)
        this.rendererConfigs = configs.renderer;
        this.cameraConfig = configs.camera;
        this.ppConfig = configs.postProcessing;

        this.camera = this.initCamera();

        this.postProcessingPass = null;
    }


    init(){
        this.initRenderer()
        this.initCamera();
    }


    initRenderer() {
        try {
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas.canvas,
                ...this.rendererConfigs
            });
        } catch (error) {
            console.error("Falha no WebGLRenderer: ", error);
            return;
        }

        this.renderer.setSize(this.width, this.height, false);
        this.renderer.setPixelRatio(this.rendererConfigs.pixelRatio || window.devicePixelRatio);
        this.renderer.shadowMap.enabled = this.rendererConfigs.shadows;
        this.renderer.setClearColor(this.rendererConfigs.clearColor, this.rendererConfigs.clearAlpha);
    }

    initCamera() {
        const aspect = this.width / this.height; 
        let camera;
        if (this.cameraConfig.type === 'perspective') {
            camera = new THREE.PerspectiveCamera(
                this.cameraConfig.fov,
                aspect,
                this.cameraConfig.near,
                this.cameraConfig.far
            );
        } else if (this.cameraConfig.type === 'orthographic') {
            const frustumSize = cameraConfig.frustumSize || 10;
            camera = new THREE.OrthographicCamera(
                frustumSize * aspect / -2, frustumSize * aspect / 2, 
                frustumSize / 2, frustumSize / -2, 
                this.cameraConfig.near, this.cameraConfig.far
            );
        }

        camera.position.z = this.cameraConfig.positionZ || 5;

        return camera;
    }

    initPostProcessing(scene) {
        const configs = this.ppConfig
        
        if (!configs) {
            console.log("akjs");
            return; 
        }
        this.composer = new EffectComposer(this.renderer);
        
        const renderPass = new RenderPass(scene, this.camera);
        this.composer.addPass(renderPass);

        this.shadersPass = new ShaderPass(SHADERS);
        
        const uniforms = this.shadersPass.uniforms;
        uniforms["pincushionActive"].value = this.ppConfig.pincushion.active ? 1.0 : 0.0;
        uniforms["pincushionStrength"].value = this.ppConfig.pincushion.strength || 1.0;
        
        uniforms["crtActive"].value = this.ppConfig.crt.active ? 1.0 : 0.0;
        uniforms["scanlineIntensity"].value = this.ppConfig.crt.scanlineIntensity || 0.08;
        uniforms["scanlineCount"].value = this.ppConfig.crt.scanlineCount || 800.0;
        uniforms["vignetteDarkness"].value = this.ppConfig.crt.vignetteDarkness || 1.0;
        uniforms["aberrationAmount"].value = this.ppConfig.crt.aberrationAmount || 0.01;

        this.composer.addPass(this.shadersPass);

        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
    }

    //   // teste apenas
    draw(scene){
        this.renderer.render(scene, this.camera);
    }


    dispose(){
        console.log("graphics")
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.compose){
            this.composer.dispose();
        }
    }

}