import * as THREE from "three";
import {
    SpriteRenderer,
    Transform,
    MouseInteraction,
    CircleHitbox,
    RigidBody,
} from "../components/index"

export function createSprite(world, scene, assets, config) {
   // ==================
    // configs
   // ==================
    const {
        imageName,
        collision = false,
        transform = {},
        mouseInteraction = {},
        rigidBody = {}
    } = config;


   // ==================
    // texture 
   // ==================
    const texture = assets.getTexture(imageName);
    if (!texture) {
        console.error(`createSprite: "${imageName}" not found`);
        return null;
    }
    texture.premultiplyAlpha = true;

    const imageWidth = texture.image.width;
    const imageHeight = texture.image.height;


   // ==================
    // scene add 
   // ==================
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.5 });
    const sprite = new THREE.Sprite(material);
    const radius = transform.scale / 2.5;

    scene.add(sprite);


    // ==================
    // ECS 
   // ==================
    const entity = world.createEntity();

    const components = [
        new MouseInteraction(mouseInteraction),
        new RigidBody(rigidBody),
        new Transform(transform),
        new SpriteRenderer(sprite, imageWidth, imageHeight),
        

        
        collision && new CircleHitbox(radius, "sprite")
    ]

    components
        .filter(Boolean)
        .forEach(component => {
            world.addComponent(entity, component);
        })

    return entity;
}