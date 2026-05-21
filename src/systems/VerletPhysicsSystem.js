import { VerletNode, Gravity } from "../components/index";

import { System } from "../ecs/System";
import { Query } from "../ecs/Query";

import * as THREE from "three";


export class VerletPhysicsSystem extends System {

// [=============================================================]  
    // atualiza posição dos nós
// [=============================================================]  
    constructor() {
        super();
        this._velocity = new THREE.Vector3();
        this._acceleration = new THREE.Vector3();
    }

    update(world, deltaTime) {
        const dt = Math.min(deltaTime, 0.16);

        const entities = Query.entitiesWith(world, VerletNode);
        for (const e of entities) {
            const node    = world.getComponent(e, VerletNode);
            const gravity = world.getComponent(e, Gravity);

            this._velocity.subVectors(node.position, node.oldPosition);
            this._velocity.multiplyScalar(0.99);
            node.oldPosition.copy(node.position);
            this._acceleration.copy(gravity.force).multiplyScalar(dt * dt);
            node.position.add(this._velocity).add(this._acceleration);
        }
    }
}