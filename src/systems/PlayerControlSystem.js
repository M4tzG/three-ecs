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

        const entities = Query.entitiesWith(world, Transform, RigidBody, PlayerController);

        for (const e of entities) {
            const transform = world.getComponent(e,Transform);
            const body = world.getComponent(e, RigidBody);
            const controller = world.getComponent(e, PlayerController);

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
                body.velocity.x = 0; 
                controller.currentState = 'IDLE';
            }

            if (this.input.isActionActive('JUMP') && controller.isGrounded) {
                body.velocity.y = controller.jumpForce; 
                controller.isGrounded = false;
                // world.addComponent(e, new Destroy());
                // console.log("sad", world.hasComponent(e, Destroy))
            }

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