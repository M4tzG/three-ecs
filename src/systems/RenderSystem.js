import { Transform, Mesh2D, ThreeView } from "../components/index";

import { System } from "../ecs/System";
import { Query } from "../ecs/Query";


export class RenderSystem extends System {

    constructor(renderer, scene){
        super();
        this.renderer = renderer;
        this.scene = scene;
        this.camera = null;
        this._cachedData = null;
    }

    update(world, deltaTime){
        this.camera = world.mainCamera;

        const entities = Query.entitiesWith(world, Transform, Mesh2D, ThreeView);

        for (const e of entities) {
            const transform = world.getComponent(e, Transform);
            const mesh = world.getComponent(e, Mesh2D);
            const view = world.getComponent(e, ThreeView);

            const sprite = view.obj;

            sprite.position.set(
                transform.position.x, 
                transform.position.y, 
                transform.position.z
            );

            sprite.scale.set(
                mesh.width * transform.scale, 
                mesh.height * transform.scale, 
                1 
            );
            
            sprite.material.rotation = transform.rotation.z;

        }
        // esta no pos-processamento
        // this.renderer.render(this.scene, this.camera);
    }
}