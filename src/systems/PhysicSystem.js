import { System } from "../ecs/System";
import { Query } from "../utils/Query";
import { Transform, RigidBody } from "../components/index";

export class PhysicSystem extends System {
    constructor() {
        super();
        this.gravity = -9.8; 
    }

    update(world, deltaTime) {
        const entities = Query.entitiesWith(world, Transform, RigidBody);

        for (const e of entities) {
            const transform = world.getComponent(e, Transform);   
            const body = world.getComponent(e, RigidBody);

            body.velocity.y += (this.gravity * body.invMass) * deltaTime;

            transform.position.x += body.velocity.x * deltaTime;
            transform.position.y += body.velocity.y * deltaTime;

            // console.log(body)
        }
    }
}