import { System } from "../ecs/System";
import { Query } from "../utils/Query";
import { MouseInteraction, VerletNode, Transform, CircleHitbox, RectHitbox } from "../components/index";
import * as THREE from "three";

export class ChainInteractionSystem extends System {
    constructor(inputManager, graphics) {
        super();
        this.input = inputManager;
        this.graphics = graphics;
        
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();
        this.mouseWorldPos = new THREE.Vector3();

        this.planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    }

    update(world, deltaTime) {
        const camera = this.graphics.camera;
        if (!camera) return;

        this.mouseVector.set(this.input.mouse.x, this.input.mouse.y);
        this.raycaster.setFromCamera(this.mouseVector, camera);
        this.raycaster.ray.intersectPlane(this.planeZ, this.mouseWorldPos);

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

            if (hitboxCircle) {
                const distSq = this.mouseWorldPos.distanceToSquared(pos);
                
                // const radius = hitboxCircle.radius * 1.5; 
                const radius = hitboxCircle.radius; 
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
                break;
            }
        }

        if (entityHit !== null && isMouseMoving) {
            const interaction = world.getComponent(entityHit, MouseInteraction);
            const verlet = world.getComponent(entityHit, VerletNode);
            
            interaction.isHovered = true;

            if (verlet && !verlet.isPinned) {
                const pushMultiplier = 0.001; 
                
                verlet.position.x += moveX * pushMultiplier;
                verlet.position.y -= moveY * pushMultiplier; 
            }
        }

        this.input.mouse.dx = 0;
        this.input.mouse.dy = 0;
    }
}