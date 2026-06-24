import { VerletNode } from "../components/index";

import { System } from "../ecs/System";
import { Query } from "../utils/Query";

import * as THREE from "three";

export class VerletPhysicsSystem extends System {

    constructor(force = 9.8) {
        super();
        this._velocity     = new THREE.Vector3();
        this._acceleration = new THREE.Vector3();
        this._gravity      = new THREE.Vector3(0, -force, 0);
    }

    update(world, deltaTime) {
        const dt = Math.min(deltaTime, 0.030); // evita explosao 

        const entities = Query.entitiesWith(world, VerletNode);
        for (const e of entities) {
            const node = world.getComponent(e, VerletNode);

            if (node.isPinned) continue;

            this._velocity.subVectors(node.position, node.oldPosition);
            this._velocity.multiplyScalar(0.99); // damping (atrito)

            node.oldPosition.copy(node.position);

            this._acceleration.copy(this._gravity).multiplyScalar(dt * dt);
            node.position.add(this._velocity).add(this._acceleration);
        }
    }
}