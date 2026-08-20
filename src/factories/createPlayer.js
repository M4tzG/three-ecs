import * as THREE from "three";
import {
    SpriteRenderer,
    Transform,
    MouseInteraction,
    CircleHitbox,
    RigidBody,
    RectHitbox,
    PlayerController
} from "../components/index"

export function createPlayer(world, scene, assets, config) {
   // ==================
    // configs
   // ==================
    const {
        imageName,
        collision = false,
        transform = {},
        mouseInteraction = {},
        rigidBody = {},
        controller = {}
    } = config;


   // ==================
    // texture 
   // ==================
    const baseTexture = assets.getTexture(imageName);
    if (!baseTexture) {
        console.error(`createSprite: "${imageName}" not found`);
        return null;
    }
    const texture = baseTexture.clone();
    texture.needsUpdate = true;
    texture.premultiplyAlpha = true;

    const imageWidth = texture.image.width;
    const imageHeight = texture.image.height;


   // ==================
    // scene add 
   // ==================
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.5 });
    const sprite = new THREE.Sprite(material);
    const radius = transform.scale / 2.5;  
    
    const aspecto = imageWidth / imageHeight;

    // Se o scale define a largura base
    const width = transform.scale;
    const height = transform.scale / aspecto;
    
    
    scene.add(sprite);

    // ==================
    // ECS 
   // ==================
    const entity = world.createEntity();
    // console.log("kajdjasd", controller);
    const components = [
        new MouseInteraction(mouseInteraction),
        new RigidBody(rigidBody),
        new Transform(transform),
        new SpriteRenderer(sprite, imageWidth, imageHeight),
        

        new PlayerController(controller),
        // collision && new CircleHitbox(radius, "sprite")
        collision && new RectHitbox(width, height, "sprite")
    ]

    components
        .filter(Boolean)
        .forEach(component => {
            world.addComponent(entity, component);
        })

    return entity;
}