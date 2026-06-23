import { System } from "../ecs/System";
import { Query } from "../utils/Query";
import { MouseInteraction, VerletNode, Transform, CircleHitbox, RectHitbox } from "../components/index";
import * as THREE from "three";

export class ChainInteractionSystem extends System {
    constructor(inputManager, graphics) {
        super();
        this.input = inputManager;
        this.graphics = graphics;
        
        // Usamos as classes matemáticas do Three.js para converter a tela para o Mundo 3D
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();
        this.mouseWorldPos = new THREE.Vector3();
        
        // Um plano imaginário exatamente onde as suas correntes ficam (Z = 0)
        this.planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    }

    update(world, deltaTime) {
        const camera = this.graphics.camera;
        if (!camera) return;

        // 1. Projeta o mouse da tela contra o plano imaginário Z=0
        this.mouseVector.set(this.input.mouse.x, this.input.mouse.y);
        this.raycaster.setFromCamera(this.mouseVector, camera);
        this.raycaster.ray.intersectPlane(this.planeZ, this.mouseWorldPos);

        // 2. Variáveis de movimento do mouse (se ele está parado, não dá o soquinho)
        const moveX = this.input.mouse.dx || 0;
        const moveY = this.input.mouse.dy || 0;
        const isMouseMoving = Math.abs(moveX) > 0 || Math.abs(moveY) > 0;

        const interactables = Query.entitiesWith(world, MouseInteraction);
        let entityHit = null;

        for (const entity of interactables) {
            const interaction = world.getComponent(entity, MouseInteraction);
            interaction.isHovered = false;

            if (!interaction.isHoverable) continue;

            const transform = world.getComponent(entity, Transform);
            const verlet = world.getComponent(entity, VerletNode);
            const pos = transform ? transform.position : (verlet ? verlet.position : null);
            
            if (!pos) continue;

            const hitboxCircle = world.getComponent(entity, CircleHitbox);
            const hitboxRect = world.getComponent(entity, RectHitbox);

            let isHit = false;

            // 3. Checagem Matemática
            if (hitboxCircle) {
                const distSq = this.mouseWorldPos.distanceToSquared(pos);
                // Multipliquei o raio por 1.5 para a "área de contato" ficar mais generosa e fácil de acertar
                const radius = hitboxCircle.radius * 1.5; 
                if (distSq <= radius * radius) {
                    isHit = true;
                }
            } else if (hitboxRect) {
                const halfW = hitboxRect.width / 2;
                const halfH = hitboxRect.height / 2;
                if (Math.abs(this.mouseWorldPos.x - pos.x) <= halfW &&
                    Math.abs(this.mouseWorldPos.y - pos.y) <= halfH) {
                    isHit = true;
                }
            }

            if (isHit) {
                entityHit = entity;
                break; // Achou um nó para balançar, já pode parar de procurar
            }
        }

        // 4. Aplica o "soquinho" caso o mouse tenha batido no elo e esteja em movimento
        if (entityHit !== null && isMouseMoving) {
            const interaction = world.getComponent(entityHit, MouseInteraction);
            const verlet = world.getComponent(entityHit, VerletNode);
            
            interaction.isHovered = true;

            if (verlet && !verlet.isPinned) {
                // Voltei para o seu valor original de 0.001 que gera o efeito sutil e perfeito
                const pushMultiplier = 0.001; 
                
                verlet.position.x += moveX * pushMultiplier;
                verlet.position.y -= moveY * pushMultiplier; 
            }
        }
        
        // ==========================================
        // IMPORTANTE: Limpar o delta do input no final
        // ==========================================
        // Evita que o último movimento do mouse fique "travado" empurrando a corrente 
        // caso o usuário pare de mexer o mouse bem em cima dela.
        this.input.mouse.dx = 0;
        this.input.mouse.dy = 0;
    }
}