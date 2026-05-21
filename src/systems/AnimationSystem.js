import { SpriteAnimation, ThreeView } from "../components/index";

import { System } from "../ecs/System";
import { Query } from "../ecs/Query";

export class AnimationSystem extends System {

// [=============================================================]   
    // conta o timer, quando der o tempo, troca de frame
// [=============================================================]  
    constructor(renderer, scene){
        super();
        this.renderer = renderer;
        this.scene = scene;
        this.camera = null;

        this.timer = 0;
    }
    
    update(world, deltaTime) {
        this.camera = world.mainCamera;
        const entities = Query.entitiesWith(world, SpriteAnimation, ThreeView);

        for (const e of entities) {
            const anim = world.getComponent(e, SpriteAnimation);
            const view = world.getComponent(e, ThreeView);

            anim.timer += deltaTime;
        
            if (anim.timer >= anim.frameTime){
                anim.timer = 0
                anim.currentFrame = (anim.currentFrame + 1) % anim.totalFrames;
                // console.log(anim.currentFrame);


                const currentColumn = anim.currentFrame % anim.columns;
                const currentRow = Math.floor(anim.currentFrame / anim.columns);


                const texture = view.obj.material.map;
                if (texture) {
                    texture.offset.x = currentColumn / anim.columns; // salva o offset na textura, ela n eh mais ela "inteira"
                    texture.offset.y = currentRow / anim.rows;
                }
            }


        }
    }
}