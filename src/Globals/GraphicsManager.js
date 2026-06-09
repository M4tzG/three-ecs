import * as THREE from "three"
import { SHADERS } from "../constants/Shaders";

export class GraphicsManager {
    constructor(canvas, configs){
        

        this.canvas = canvas;
        this.width = this.canvas.getWidth();
        this.height = this.canvas.getHeight();

        
        this.renderer = null;
        this.composer = null;
        

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
        
        if (!this.ppConfigs) {
            console.log("akjs")
            return; 
        }
        this.composer = new EffectComposer(this.renderer);
        
        // 1. Passa a cena normal
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // 2. Passa o Uber Shader (CRT + Pincushion combinados)
        this.shadersPass = new ShaderPass(SHADERS);
        
        // Aplica as configurações iniciais recebidas
        const uniforms = this.shadersPass.uniforms;
        uniforms["pincushionActive"].value = ppConfigs.pincushion.active ? 1.0 : 0.0;
        uniforms["pincushionStrength"].value = ppConfigs.pincushion.strength || 1.0;
        
        uniforms["crtActive"].value = ppConfigs.crt.active ? 1.0 : 0.0;
        uniforms["scanlineIntensity"].value = ppConfigs.crt.scanlineIntensity || 0.08;
        uniforms["scanlineCount"].value = ppConfigs.crt.scanlineCount || 800.0;
        uniforms["vignetteDarkness"].value = ppConfigs.crt.vignetteDarkness || 1.0;
        uniforms["aberrationAmount"].value = ppConfigs.crt.aberrationAmount || 0.01;

        this.composer.addPass(this.shadersPass);

        // 3. Output final (ajuda na correção de cores em versões recentes do Three)
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
    }

}