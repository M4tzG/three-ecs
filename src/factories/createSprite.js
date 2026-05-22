import * as THREE from "three";
import {
    SpriteRenderer,
    Transform
} from "../components/index"

export function createSprite(world, scene, assets, config) {
    const {
        imageName,
        transform = {},
    } = config;

    const texture = assets.getTexture(imageName);
    if (!texture) {
        console.error(`createSprite: "${imageName}" not found`);
        return null;
    }
    texture.premultiplyAlpha = true;

    const imageWidth = texture.image.width;
    const imageHeight = texture.image.height;

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.5 });
    const sprite = new THREE.Sprite(material);

    scene.add(sprite);

    const entity = world.createEntity();

    world.addComponent(entity, new Transform(transform)); 
    world.addComponent(entity, new SpriteRenderer(sprite, imageWidth, imageHeight)); 

    return entity;
}