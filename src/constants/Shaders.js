import * as THREE from "three";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const SHADERS = {
    uniforms: {
        "tDiffuse": { value: null },
        "time": { value: 0.0 },
        "pincushionActive": { value: 1.0 }, 
        "pincushionStrength": { value: 1.0 }, 
        "crtActive": { value: 1.0 }, 
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
        uniform float pincushionActive;
        uniform float pincushionStrength;
        uniform float crtActive;
        uniform float scanlineIntensity;
        uniform float scanlineCount;
        uniform float vignetteDarkness;
        uniform float aberrationAmount;
        varying vec2 vUv;

        void main() {
            vec2 finalUv = vUv;
            
            // --- PINCUSHION ---
            if (pincushionActive > 0.5) {
                vec2 centeredUv = vUv - 0.5;
                float distanceSq = dot(centeredUv, centeredUv); 
                float distortion = 1.0 + pincushionStrength * distanceSq; 
                finalUv = centeredUv * distortion + 0.5;
                
                // Se saiu da tela, pinta de preto
                if (finalUv.x < 0.0 || finalUv.x > 1.0 || finalUv.y < 0.0 || finalUv.y > 1.0) {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                    return; 
                }
            }

            vec4 color = vec4(0.0);

            // --- CRT ---
            if (crtActive > 0.5) {
                // Aberração cromática usa o finalUv (imagem distorcida)
                float r = texture2D(tDiffuse, vec2(finalUv.x + aberrationAmount, finalUv.y)).r;
                float g = texture2D(tDiffuse, finalUv).g; 
                float b = texture2D(tDiffuse, vec2(finalUv.x - aberrationAmount, finalUv.y)).b;
                color = vec4(r, g, b, 1.0);

                // --- CORREÇÃO AQUI ---
                // Usa o vUv ORIGINAL (reto) para as scanlines não entortarem!
                float wave = sin(vUv.y * scanlineCount - time * 10.0);
                color.rgb -= (wave * 0.5 + 0.5) * scanlineIntensity;

                // Usa o vUv ORIGINAL (reto) para a vignette ser um círculo/elipse perfeito
                vec2 centerDist = vUv - 0.5;
                float vignette = length(centerDist);
                color.rgb *= 1.0 - smoothstep(0.4, 0.8, vignette) * vignetteDarkness;
            } else {
                color = texture2D(tDiffuse, finalUv);
            }

            gl_FragColor = color;
        }
    `
};