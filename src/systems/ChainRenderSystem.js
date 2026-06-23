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
                // Posição = meio entre este nó e o próximo
                link.mesh.position.lerpVectors(node.position, node.nextNode.position, 0.5);

                // Direção do segmento
                _target.subVectors(node.nextNode.position, node.position);

                // Ângulo no plano XY (corrente 2D em cena 3D)
                const angle = Math.atan2(_target.x, -_target.y);

                if (link.isOdd) {
                    // Elos ímpares: girados 90° para dar ilusão de profundidade
                    link.mesh.rotation.set(0, 0, angle + Math.PI / 2);
                } else {
                    // link.mesh.rotation.set(0, 0, angle);
                    link.mesh.rotation.set(0, 0, angle + Math.PI / 2);
                }
            } else {
                const angle = Math.atan2(_target.x, -_target.y);
                // Último nó (sem próximo): só atualiza posição
                link.mesh.position.copy(node.position + node.position/1.8);
                link.mesh.rotation.set(0, 0, angle + Math.PI / 2);
            }
        }
    }
}