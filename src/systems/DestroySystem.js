import { System } from "../ecs/System";
import { Query } from "../utils/Query";
import { Destroy, SpriteRenderer, CircleHitbox, RectHitbox } from "../components/index";

export class DestroySystem extends System {
    constructor(scene) {
        super();
        this.scene = scene;
    }

    update(world, deltaTime) {
        const entitiesToDestroy = Query.entitiesWith(world, Destroy);

        for (const e of entitiesToDestroy) {
            
            const spriteRenderer = world.getComponent(e, SpriteRenderer);
            if (spriteRenderer && spriteRenderer.obj) {
                const sprite = spriteRenderer.obj;
                if (sprite.material) {
                    if (sprite.material.map) sprite.material.map.dispose();
                    sprite.material.dispose();
                }
                this.scene.remove(sprite);
            }

            const circle = world.getComponent(e, CircleHitbox);
            const rect = world.getComponent(e, RectHitbox);
            const hitbox = circle || rect;

            if (hitbox && hitbox.debugMesh) {
                hitbox.debugMesh.geometry.dispose();
                hitbox.debugMesh.material.dispose();
                this.scene.remove(hitbox.debugMesh);
            }
            world.destroyEntity(e);
        }
    }
}