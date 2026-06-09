import { System } from "../ecs/System"
import { Query } from "../utils/Query";
import { MouseInteraction, Transform } from "../components/index";

export class EffectSystem extends System {
    constructor(scene, input){
        super();
        this.input = input;
        this.scene = scene;

    }

    update(world, deltaTime){
        const entities = Query.entitiesWith(world, Transform, MouseInteraction);

        for(const e of entities){
            const transform = world.getComponent(e, Transform);
            const interaction = world.getComponent(e, MouseInteraction);
            if (interaction.isParallaxed) { 
                
                if (transform.initialX === undefined) {
                    transform.initialX = transform.position.x;
                    transform.initialY = transform.position.y;
                }

                const inputX = this.input.mouse.x;
                const inputY = this.input.mouse.y;

                const targetX = transform.initialX + (inputX * interaction.parallaxFactor);
                const targetY = transform.initialY + (inputY * interaction.parallaxFactor);

                const lerpSpeed = 5 * deltaTime; 

                transform.position.x += (targetX - transform.position.x) * lerpSpeed;   
                transform.position.y += (targetY - transform.position.y) * lerpSpeed;

            }

        }
        // console.log(this.input.mouse.x, this.input.mouse.y);
    }
}