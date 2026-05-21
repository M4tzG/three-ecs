import { Interaction, 
        Transform, 
        Input } from "../components/index";  

import { System } from "../ecs/System"; 
import { Query } from "../ecs/Query";  





export class EffectSystem extends System {

// [=============================================================]   
    // por hora apenas implementaçao de um parallax
// [=============================================================]   

    constructor() {
        super();
        this._cachedData = null;
    }

    update(world, deltaTime) {

        const entities = Query.entitiesWith(world, Interaction, Transform, Input);
        for (const e of entities){
            const interaction = world.getComponent(e, Interaction);
            const transform = world.getComponent(e, Transform);
            const input = world.getComponent(e, Input);

            if (interaction.isParallaxed) { 
                
                if (transform.initialX === undefined) {
                    transform.initialX = transform.position.x;
                    transform.initialY = transform.position.y;
                }

                const inputX = interaction.isMobile ? input.gyro.x : input.mouse.x;
                const inputY = interaction.isMobile ? input.gyro.y : input.mouse.y;

                const targetX = transform.initialX + (inputX * interaction.parallaxFactor);
                const targetY = transform.initialY + (inputY * interaction.parallaxFactor);

                const lerpSpeed = 5 * deltaTime; 

                transform.position.x += (targetX - transform.position.x) * lerpSpeed;   
                transform.position.y += (targetY - transform.position.y) * lerpSpeed;
            }
        }
    }
}



