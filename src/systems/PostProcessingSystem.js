import { PostProcessing } from "../components/PostProcessing";

import { System } from "../ecs/System";
import { Query } from "../ecs/Query";

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';


const SHADERS = {
    pincushion: {
        uniforms: {
            "tDiffuse": { value: null },
            "strength": { value: 1 } // Valores negativos = Pincushion, Valores positivos = Barril
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float strength;
            varying vec2 vUv;

            void main() {
                vec2 uv = vUv - 0.5;
                float distanceSq = dot(uv, uv); 
                float distortion = 1.0 + strength * distanceSq; 
                vec2 distortedUv = uv * distortion + 0.5;
                if (distortedUv.x < 0.0 || distortedUv.x > 1.0 || distortedUv.y < 0.0 || distortedUv.y > 1.0) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                } else {
                    gl_FragColor = texture2D(tDiffuse, distortedUv);
                }
            }
        `
    },
    crt: {
        uniforms: {
            "tDiffuse": { value: null },
            "time": { value: 0.0 },
            "scanlineIntensity": { value: 0.08 },
            "scanlineCount": { value: 800.0 },
            "vignetteDarkness": { value: 1.0 },
            "aberrationAmount": { value: 0.01 },

        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float time;
            uniform float scanlineIntensity;
            uniform float scanlineCount;
            uniform float vignetteDarkness;
            uniform float aberrationAmount;
            
            varying vec2 vUv;

            void main() {
                // --- CHROMATIC ABERRATION ---
                float r = texture2D(tDiffuse, vec2(vUv.x + aberrationAmount, vUv.y)).r;
                float g = texture2D(tDiffuse, vUv).g; // O verde fica no lugar certo
                float b = texture2D(tDiffuse, vec2(vUv.x - aberrationAmount, vUv.y)).b;
                
                vec4 color = vec4(r, g, b, 1.0);

                // --- SCANLINES ---
                float wave = sin(vUv.y * scanlineCount - time * 10.0);
                float scanline = (wave * 0.5 + 0.5) * scanlineIntensity;
                color.rgb -= scanline;

                // --- VIGNETTE ---
                vec2 centerDist = vUv - 0.5;
                float vignette = length(centerDist);
                color.rgb *= 1.0 - smoothstep(0.4, 0.8, vignette) * vignetteDarkness;

                gl_FragColor = color;
            }
        `
    }
}


export class PostProcessingSystem extends System {

    constructor(renderer, scene) {
        super();
        this.renderer = renderer;
        this.scene = scene;
        this.camera = null;
        this.mainEntity = null;
        
        this.composer = new EffectComposer(this.renderer);

        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);
        
        this.pincushionPass = new ShaderPass(SHADERS.pincushion);
        this.composer.addPass(this.pincushionPass);

        this.crtPass = new ShaderPass(SHADERS.crt);
        this.composer.addPass(this.crtPass);

        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);

        this.elapsedTime = 0;
    }

    update(world, deltaTime) {
        this.camera = world.mainCamera;

        if (!this.camera) return;

        this.renderPass.camera = this.camera;

        this.elapsedTime += deltaTime;


        const entities = Query.entitiesWith(world, PostProcessing);
            
        if (entities.length === 0) {
            this.renderer.render(this.scene, this.camera);
            return;
        }
        if (entities.length > 1) {
            console.warn("mais de um pos-processamento na cena...");
        }
        this.mainEntity = entities[0]; 
        
        
        const config = world.getComponent(this.mainEntity, PostProcessing);

        if (!config) {
            this.mainEntity = null;
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // para n deixar as figuras com uma borda estranha branca
        this.pincushionPass.enabled = config.pincushion.active; 
        // aplica todos os tipos de pos-processamento, se nao tiver nenhum ativo, usa o render normal, sem composer
        this.pincushionPass.uniforms["strength"].value = config.pincushion.strength;

        this.crtPass.enabled = config.crt.active;
        this.crtPass.uniforms["time"].value = this.elapsedTime;
        this.crtPass.uniforms["scanlineIntensity"].value = config.crt.scanlineIntensity;
        this.crtPass.uniforms["scanlineCount"].value = config.crt.scanlineCount;
        this.crtPass.uniforms["vignetteDarkness"].value = config.crt.vignetteDarkness;
        this.crtPass.uniforms["aberrationAmount"].value = config.crt.aberrationAmount;

        this.composer.render();

    }
}