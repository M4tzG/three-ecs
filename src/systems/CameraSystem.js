import { Camera, Transform } from "../components/index";

import { System } from "../ecs/System"; 
import { Query } from "../ecs/Query";


export class CameraSystem extends System {
    constructor() {
        super();
    }
    update(world, delta) {

        const entities = Query.entitiesWith(world, Camera, Transform);

        for (const e of entities) {
            const cameraComp = world.getComponent(e, Camera);
            const transform = world.getComponent(e, Transform);
            
            if (cameraComp.isActive) {
                cameraComp.camera.position.z = transform.position.z;
                cameraComp.camera.lookAt(cameraComp.lookAt.x, cameraComp.lookAt.y, cameraComp.lookAt.z);

                world.setMainCamera(cameraComp.camera); 
            }
        }
    }
}