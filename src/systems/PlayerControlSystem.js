// src/systems/PlayerControlSystem.js
import { System } from "../ecs/System";
import { Query } from "../utils/Query";
import { Transform, RigidBody, PlayerController, Destroy } from "../components/index";

export class PlayerControlSystem extends System {
    constructor(inputManager) {
        super();
        this.input = inputManager;
    }

    update(world, deltaTime) {
        // Busca todas as entidades jogáveis
        const entities = Query.entitiesWith(world, Transform, RigidBody, PlayerController);

        for (const e of entities) {
            const transform = world.getComponent(e,Transform);
            const body = world.getComponent(e, RigidBody);
            const controller = world.getComponent(e, PlayerController);

            // 1. Movimentação Horizontal
            if (this.input.isActionActive('LEFT')) {
                body.velocity.x = -controller.speed;
                controller.facingRight = false;
                
                controller.currentState = 'WALK';
            } 
            else if (this.input.isActionActive('RIGHT')) {
                body.velocity.x = controller.speed;
                controller.facingRight = true;
                controller.currentState = 'WALK';
            } 
            else {
                // Parar o personagem se não estiver apertando nada
                body.velocity.x = 0; 
                controller.currentState = 'IDLE';
            }

            // 2. Pulo
            // Só deixa pular se a ação estiver ativa E ele estiver no chão
            if (this.input.isActionActive('JUMP') && controller.isGrounded) {
                // Em 2D no Three.js dependendo de como você mapeou Y, o pulo é positivo
                body.velocity.y = controller.jumpForce; 
                controller.isGrounded = false; // Ele acabou de pular, então não está mais no chão
                // world.addComponent(e, new Destroy());
                // console.log("sad", world.hasComponent(e, Destroy))
            }

            // 3. Define o estado de Pulo/Queda para as futuras animações
            if (!controller.isGrounded) {
                if (body.velocity.y > 0) {
                    controller.currentState = 'JUMP';
                } else {
                    controller.currentState = 'FALL';
                }
            }
            console.log(controller.facingRight)

        }
    }
}