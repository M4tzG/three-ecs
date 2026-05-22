import { System } from "../ecs/System"
import { Query } from "../utils/Query";
import { Transform, SpriteRenderer } from "../components/index";

export class RenderSystem extends System {
    constructor(scene, graphics){
        super();
        this.graphics = graphics;
        this.renderer = this.graphics.renderer;
        this.camera = this.graphics.camera;
        this.scene = scene;

    }

    update(world, deltaTime){
        const entities = Query.entitiesWith(world, Transform, SpriteRenderer);

        for(const e of entities){
            const transform = world.getComponent(e, Transform);
            const spriteRenderer = world.getComponent(e, SpriteRenderer);

            const sprite = spriteRenderer.obj;

            sprite.position.set(
                transform.position.x, 
                transform.position.y, 
                transform.position.z
            );

            sprite.scale.set(
                transform.scale, 
                transform.scale, 
                1 
            );
            
            sprite.material.rotation = transform.rotation.z;
        }
        // console.log(this.camera)
        this.renderer.render(this.scene, this.camera);
    }
}