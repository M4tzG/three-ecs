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
            
            // 1. Limpa a memória do Sprite
            const spriteRenderer = world.getComponent(e, SpriteRenderer);
            if (spriteRenderer && spriteRenderer.obj) {
                const sprite = spriteRenderer.obj;
                if (sprite.material) {
                    if (sprite.material.map) sprite.material.map.dispose();
                    sprite.material.dispose();
                }
                this.scene.remove(sprite);
            }

            // 2. Limpa os Debug Meshes da Colisão!
            const circle = world.getComponent(e, CircleHitbox);
            const rect = world.getComponent(e, RectHitbox);
            const hitbox = circle || rect; // Pega qual dos dois existir

            if (hitbox && hitbox.debugMesh) {
                // Descarta a Geometria (BufferGeometry)
                hitbox.debugMesh.geometry.dispose();
                // Descarta o Material (LineBasicMaterial)
                hitbox.debugMesh.material.dispose();
                // Remove da cena do Three.js
                this.scene.remove(hitbox.debugMesh);
            }

            // 3. Finalmente, apaga a entidade do ECS
            world.destroyEntity(e);
        }
    }
}