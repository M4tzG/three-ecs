import * as THREE from 'three';
import { System } from "../ecs/System"
import { Query } from "../utils/Query";
import { CircleHitbox, Transform, RigidBody } from "../components/index";

export class CollisionSystem extends System {
    constructor(input, scene){
        super();
        this.input = input;
        this.scene = scene;

    }

    update(world, deltaTime){
        const entities = Query.entitiesWith(world, Transform, CircleHitbox);

        

        for(let i = 0; i < entities.length; i++){
            const entityA = entities[i];


            const transform_A = world.getComponent(entityA, Transform);
            const hitbox_A = world.getComponent(entityA, CircleHitbox);
            const rb_A = world.getComponent(entityA, RigidBody);

            for (let j = i + 1; j < entities.length; j++) {
                const entityB = entities[j];
                const transform_B = world.getComponent(entityB, Transform);
                const hitbox_B = world.getComponent(entityB, CircleHitbox);
                const rb_B = world.getComponent(entityB, RigidBody);

                const canCollide =
                    (hitbox_A.layer & hitbox_B.mask) !== 0 &&
                    (hitbox_B.layer & hitbox_A.mask) !== 0;

                // console.log(canCollide)
                if (!canCollide) continue;


                const dx = transform_A.position.x - transform_B.position.x;
                const dy = transform_A.position.y - transform_B.position.y;
                const distanceSquared = (dx * dx) + (dy * dy);
                const radiusSum = hitbox_A.radius + hitbox_B.radius;

                const isColliding =
                    distanceSquared <= radiusSum * radiusSum;

            if (isColliding) {
                const distance = Math.sqrt(distanceSquared);
                
                if (distance === 0) continue; 

                const nx = dx / distance;
                const ny = dy / distance;

                const penetration = radiusSum - distance;
                const totalInvMass = rb_A.invMass + rb_B.invMass;

                if (totalInvMass === 0) continue; 

                // ==========================================
                // Posicao
                // ==========================================
                
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
                // velocidade
                // ==========================================
                
                const relVelX = rb_A.velocity.x - rb_B.velocity.x;
                const relVelY = rb_A.velocity.y - rb_B.velocity.y;

                const velAlongNormal = (relVelX * nx) + (relVelY * ny);

                if (velAlongNormal > 0) continue;

                const j = -(velAlongNormal) / totalInvMass;

                if (rb_A.invMass > 0) {
                    rb_A.velocity.x += j * nx * rb_A.invMass;
                    rb_A.velocity.y += j * ny * rb_A.invMass;
                }

                if (rb_B.invMass > 0) {
                    rb_B.velocity.x -= j * nx * rb_B.invMass;
                    rb_B.velocity.y -= j * ny * rb_B.invMass;
                }
            }
     
            }


            if (!hitbox_A.debugMesh) {
                hitbox_A.debugMesh =
                    this.createDebugCircle(hitbox_A, transform_A);
            }
            hitbox_A.debugMesh.position.copy(
                transform_A.position
            );

        }
    }

    createDebugCircle(hitbox, transform, color = 0x00ff00) {

        const segments = 64;
        const points = [];

        for (let i = 0; i <= segments; i++) {

            const theta = (i / segments) * Math.PI * 2;

            points.push(
                new THREE.Vector3(
                    Math.cos(theta) * hitbox.radius,
                    Math.sin(theta) * hitbox.radius,
                    0
                )
            );
        }

        const geometry =
            new THREE.BufferGeometry().setFromPoints(points);

        const material =
            new THREE.LineBasicMaterial({ color });

        const circle =
            new THREE.LineLoop(geometry, material);

        circle.position.copy(transform.position);

        this.scene.add(circle);

        return circle;
    }
}