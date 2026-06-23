import { Constraint, VerletNode } from "../components/index";

import { Query } from "../utils/Query";
import { System } from "../ecs/System";

import * as THREE from 'three';

export class ConstraintSystem extends System {

    constructor(iterations = 15, stiffness = 1.8) {
        super();
        this.iterations = iterations;
        this._delta  = new THREE.Vector3();
        this._offset = new THREE.Vector3();
        this.stiffness = stiffness; 
    }

    update(world, deltaTime) {
        const entities = Query.entitiesWith(world, Constraint);

        // Roda N iterações por frame — quanto mais, mais rígida a corrente
        for (let iter = 0; iter < this.iterations; iter++) {
            for (const c of entities) {
                const constraint = world.getComponent(c, Constraint);
                const nodeA = world.getComponent(constraint.entityA, VerletNode);
                const nodeB = world.getComponent(constraint.entityB, VerletNode);

                if (!nodeA || !nodeB) continue;

                this._delta.subVectors(nodeB.position, nodeA.position);
                const currentDist = this._delta.length();
                if (currentDist === 0) continue;

                const wA = nodeA.isPinned ? 0 : 1;
                const wB = nodeB.isPinned ? 0 : 1;
                const wSum = wA + wB;
                if (wSum === 0) continue;

                // BUG CORRIGIDO: era "distance" (undefined) → "constraint.distance"
                const error = currentDist - constraint.distance;
                const correction = (error / currentDist) * this.stiffness;

                this._offset.copy(this._delta).multiplyScalar(correction / wSum);

                if (!nodeA.isPinned) nodeA.position.add(this._offset);
                if (!nodeB.isPinned) nodeB.position.sub(this._offset);
            }
        }
    }
}