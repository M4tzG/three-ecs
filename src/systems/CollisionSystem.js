import * as THREE from 'three';
import { System } from "../ecs/System"
import { Query } from "../utils/Query";
import { CircleHitbox, RectHitbox, Transform, RigidBody, PlayerController, Destroy } from "../components/index";

export class CollisionSystem extends System {
    constructor(input, scene){
        super();
        this.input = input;
        this.scene = scene;
    }

    update(world, deltaTime){

        const circles = Query.entitiesWith(world, Transform, CircleHitbox);
        const rects = Query.entitiesWith(world, Transform, RectHitbox);
        const entities = [...new Set([...circles, ...rects])];

        for(let i = 0; i < entities.length; i++){
            const entityA = entities[i];
            const transform_A = world.getComponent(entityA, Transform);
            const rb_A = world.getComponent(entityA, RigidBody);
            
            if (!transform_A || !rb_A) continue;
            // ================
            let hitbox_A = world.getComponent(entityA, CircleHitbox);
            let typeA = 'circle';
            if (!hitbox_A) {
                hitbox_A = world.getComponent(entityA, RectHitbox);
                typeA = 'rect';
            }

            for (let j = i + 1; j < entities.length; j++) {
                const entityB = entities[j];
                const transform_B = world.getComponent(entityB, Transform);
                const rb_B = world.getComponent(entityB, RigidBody);

                let hitbox_B = world.getComponent(entityB, CircleHitbox);
                let typeB = 'circle';
                if (!transform_B || !rb_B) continue;
                if (!hitbox_B) {
                    hitbox_B = world.getComponent(entityB, RectHitbox);
                    typeB = 'rect';
                }

                const canCollide =
                    (hitbox_A.layer & hitbox_B.mask) !== 0 &&
                    (hitbox_B.layer & hitbox_A.mask) !== 0;

                if (!canCollide) continue;

                let isColliding = false;
                let nx = 0, ny = 0, penetration = 0;

                // ==========================================
                // FASE DE DETECÇÃO (Acha a Normal e Penetração)
                // ==========================================
                
                if (typeA === 'circle' && typeB === 'circle') {
                    const dx = transform_A.position.x - transform_B.position.x;
                    const dy = transform_A.position.y - transform_B.position.y;
                    const distanceSquared = (dx * dx) + (dy * dy);
                    const radiusSum = hitbox_A.radius + hitbox_B.radius;

                    if (distanceSquared <= radiusSum * radiusSum) {
                        const distance = Math.sqrt(distanceSquared);
                        if (distance !== 0) {
                            isColliding = true;
                            nx = dx / distance;
                            ny = dy / distance;
                            penetration = radiusSum - distance;
                        }
                    }
                } 
                else if (typeA === 'rect' && typeB === 'rect') {
                    const halfWA = hitbox_A.width / 2;
                    const halfHA = hitbox_A.height / 2;
                    const halfWB = hitbox_B.width / 2;
                    const halfHB = hitbox_B.height / 2;

                    const dx = transform_A.position.x - transform_B.position.x;
                    const dy = transform_A.position.y - transform_B.position.y;
                    
                    const overlapX = halfWA + halfWB - Math.abs(dx);
                    const overlapY = halfHA + halfHB - Math.abs(dy);

                    if (overlapX > 0 && overlapY > 0) {
                        isColliding = true;
                        if (overlapX < overlapY) {
                            nx = dx > 0 ? 1 : -1;
                            ny = 0;
                            penetration = overlapX;
                        } else {
                            nx = 0;
                            ny = dy > 0 ? 1 : -1;
                            penetration = overlapY;
                        }
                    }
                }
                else if (typeA === 'circle' && typeB === 'rect') {
                    const rectX = transform_B.position.x;
                    const rectY = transform_B.position.y;
                    const halfW = hitbox_B.width / 2;
                    const halfH = hitbox_B.height / 2;

                    const closestX = Math.max(rectX - halfW, Math.min(transform_A.position.x, rectX + halfW));
                    const closestY = Math.max(rectY - halfH, Math.min(transform_A.position.y, rectY + halfH));

                    const dx = transform_A.position.x - closestX;
                    const dy = transform_A.position.y - closestY;
                    const distanceSquared = (dx * dx) + (dy * dy);

                    if (distanceSquared <= hitbox_A.radius * hitbox_A.radius) {
                        isColliding = true;
                        if (distanceSquared === 0) {
                            const overlapX = halfW - Math.abs(transform_A.position.x - rectX);
                            const overlapY = halfH - Math.abs(transform_A.position.y - rectY);
                            if (overlapX < overlapY) {
                                nx = transform_A.position.x > rectX ? 1 : -1;
                                ny = 0;
                                penetration = hitbox_A.radius + overlapX;
                            } else {
                                nx = 0;
                                ny = transform_A.position.y > rectY ? 1 : -1;
                                penetration = hitbox_A.radius + overlapY;
                            }
                        } else {
                            const distance = Math.sqrt(distanceSquared);
                            nx = dx / distance;
                            ny = dy / distance;
                            penetration = hitbox_A.radius - distance;
                        }
                    }
                }
                else if (typeA === 'rect' && typeB === 'circle') {
                    // É a exata mesma lógica do de cima, mas invertendo a direção da normal
                    const rectX = transform_A.position.x;
                    const rectY = transform_A.position.y;
                    const halfW = hitbox_A.width / 2;
                    const halfH = hitbox_A.height / 2;

                    const closestX = Math.max(rectX - halfW, Math.min(transform_B.position.x, rectX + halfW));
                    const closestY = Math.max(rectY - halfH, Math.min(transform_B.position.y, rectY + halfH));

                    const dx = transform_B.position.x - closestX;
                    const dy = transform_B.position.y - closestY;
                    const distanceSquared = (dx * dx) + (dy * dy);

                    if (distanceSquared <= hitbox_B.radius * hitbox_B.radius) {
                        isColliding = true;
                        if (distanceSquared === 0) {
                            const overlapX = halfW - Math.abs(transform_B.position.x - rectX);
                            const overlapY = halfH - Math.abs(transform_B.position.y - rectY);
                            if (overlapX < overlapY) {
                                nx = transform_B.position.x > rectX ? -1 : 1;
                                ny = 0;
                                penetration = hitbox_B.radius + overlapX;
                            } else {
                                nx = 0;
                                ny = transform_B.position.y > rectY ? -1 : 1;
                                penetration = hitbox_B.radius + overlapY;
                            }
                        } else {
                            const distance = Math.sqrt(distanceSquared);
                            nx = -(dx / distance); // Inverte
                            ny = -(dy / distance); // Inverte
                            penetration = hitbox_B.radius - distance;
                        }
                    }
                }

                // ==========================================
                // FASE DE RESOLUÇÃO (Seu código original)
                // ==========================================
                
                if (isColliding) {
                    
                    const totalInvMass = rb_A.invMass + rb_B.invMass;
                    if (totalInvMass === 0) continue; 

                    // Posicao
                    if (rb_A.invMass > 0) {
                        const moveRatioA = rb_A.invMass / totalInvMass;
                        transform_A.position.x += nx * penetration * moveRatioA;
                        transform_A.position.y += ny * penetration * moveRatioA;
                    }

                    if (rb_B.invMass > 0) {
                        const moveRatioB = rb_B.invMass / totalInvMass;
                        transform_B.position.x -= nx * penetration * moveRatioB;
                        transform_B.position.y -= ny * penetration * moveRatioB;
                    }

                    // ==========================================
                    // DETECÇÃO DE CHÃO (IS GROUNDED)
                    // ==========================================
                    
                    // Tenta pegar o componente de controle das duas entidades
                    const ctrlA = world.getComponent(entityA, PlayerController);
                    const ctrlB = world.getComponent(entityB, PlayerController);

                    if (ctrlA) {
                        // Se a entidade A é o Player e o ny > 0, significa que a colisão 
                        // empurrou o Player para CIMA. Logo, ele bateu os pés no chão.
                        if (ny > 0.1) { 
                            ctrlA.isGrounded = true;
                        }
                    }
                    if (ctrlB) {
                        // Se a entidade B é o Player, a normal está invertida para ele.
                        // Se ny < -0.1, significa que o Player B foi empurrado para CIMA.
                        if (ny < -0.1) {
                            ctrlB.isGrounded = true;
                        }
                    }

                    // Velocidade
                    const relVelX = rb_A.velocity.x - rb_B.velocity.x;
                    const relVelY = rb_A.velocity.y - rb_B.velocity.y;

                    const velAlongNormal = (relVelX * nx) + (relVelY * ny);

                    if (velAlongNormal > 0) continue;

                    // troquei a variável "j" por "jImpulse" para não dar conflito com o "j" do seu for loop
                    const jImpulse = -(velAlongNormal) / totalInvMass;

                    if (rb_A.invMass > 0) {
                        rb_A.velocity.x += jImpulse * nx * rb_A.invMass;
                        rb_A.velocity.y += jImpulse * ny * rb_A.invMass;
                    }

                    if (rb_B.invMass > 0) {
                        rb_B.velocity.x -= jImpulse * nx * rb_B.invMass;
                        rb_B.velocity.y -= jImpulse * ny * rb_B.invMass;
                    }
                }
            }

            // ==========================================
            // DEBUG RENDERER
            // ==========================================
            if (!hitbox_A.debugMesh) {
                if (typeA === 'circle') {
                    hitbox_A.debugMesh = this.createDebugCircle(hitbox_A, transform_A);
                } else {
                    hitbox_A.debugMesh = this.createDebugRect(hitbox_A, transform_A);
                }
            }
            hitbox_A.debugMesh.position.copy(transform_A.position);
        }
    }

    createDebugCircle(hitbox, transform, color = 0x00ff00) {
        const segments = 32; // Diminuí um pouco de 64 para 32 pra ficar mais leve na sua cena
        const points = [];
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(theta) * hitbox.radius,
                Math.sin(theta) * hitbox.radius, 0
            ));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color });
        const circle = new THREE.LineLoop(geometry, material);
        circle.position.copy(transform.position);
        this.scene.add(circle);
        return circle;
    }

    createDebugRect(hitbox, transform, color = 0x00ff00) {
        const halfW = hitbox.width / 2;
        const halfH = hitbox.height / 2;
        const points = [
            new THREE.Vector3(-halfW, -halfH, 0),
            new THREE.Vector3(halfW, -halfH, 0),
            new THREE.Vector3(halfW, halfH, 0),
            new THREE.Vector3(-halfW, halfH, 0)
        ];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color });
        const rect = new THREE.LineLoop(geometry, material);
        rect.position.copy(transform.position);
        this.scene.add(rect);
        return rect;
    }
}