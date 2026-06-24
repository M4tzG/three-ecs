import { VerletNode, ChainLink } from "../components/index";

import { System } from "../ecs/System";
import { Query } from "../utils/Query";

import * as THREE from "three";

const _target = new THREE.Vector3();
const _up     = new THREE.Vector3(0, 1, 0);

export class ChainRenderSystem extends System {

    constructor() {
        super();
    }

    update(world, deltaTime) {
        const entities = Query.entitiesWith(world, VerletNode, ChainLink);

        for (const e of entities) {
            const node = world.getComponent(e, VerletNode);
            const link = world.getComponent(e, ChainLink);

            if (!link.mesh) continue;

            if (node.nextNode) {

                link.mesh.position.lerpVectors(node.position, node.nextNode.position, 0.5);

                _target.subVectors(node.nextNode.position, node.position);

                const angle = Math.atan2(_target.x, -_target.y);

                if (link.isOdd) {
                    link.mesh.rotation.set(0, 0, angle + Math.PI / 2);
                } else {
                    // link.mesh.rotation.set(0, 0, angle);
                    link.mesh.rotation.set(0, 0, angle + Math.PI / 2);
                }
            } else {
                const angle = Math.atan2(_target.x, -_target.y);
                link.mesh.position.copy(node.position + node.position/1.8);
                link.mesh.rotation.set(0, 0, angle + Math.PI / 2);
            }
        }
    }
}