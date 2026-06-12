import { System } from "../ecs/System"
import { Query } from "../utils/Query";
import { Transform, SpriteRenderer, PlayerController } from "../components/index";

export class RenderSystem extends System {
    constructor(scene, graphics){
        super();
        this.graphics = graphics;
        this.renderer = this.graphics.renderer;
        this.camera = this.graphics.camera;
        this.composer = this.graphics.composer;
        this.scene = scene;

    }

    update(world, deltaTime){
        const entities = Query.entitiesWith(world, Transform, SpriteRenderer);

        for(const e of entities){
            const transform = world.getComponent(e, Transform);
            const spriteRenderer = world.getComponent(e, SpriteRenderer);
            const controller = world.getComponent(e, PlayerController)

            if (!transform || !spriteRenderer ) continue;

            const sprite = spriteRenderer.obj;
            
            
            sprite.position.set(
                transform.position.x, 
                transform.position.y, 
                transform.position.z
            );

            if (controller) {
                if (controller.facingRight) {
                    // Estado Normal (olhando para a direita)
                    sprite.material.map.repeat.x = 1;
                    sprite.material.map.offset.x = 0;
                } else {
                    // Estado Espelhado (olhando para a esquerda)
                    sprite.material.map.repeat.x = -1;
                    sprite.material.map.offset.x = 1;
                }
                
                // Opcional: dependendo da versão do Three.js, você pode não precisar 
                // do needsUpdate = true todo frame só para alterar o offset/repeat. 
                // Teste comentar essa linha abaixo depois para ver se ganha performance!
                sprite.material.map.needsUpdate = true; 
            }

            sprite.scale.set(
                transform.scale.x, 
                transform.scale.y, 
                1 
            );

            
            sprite.material.rotation = transform.rotation.z;
            
        }
        // console.log(this.composer)
        if (!this.composer){
            this.renderer.render(this.scene, this.camera);
        } else this.composer.render();
        
    }
}