import * as THREE from "three";

import {
    Transform,
    Mesh2D,
    ThreeView,
    Interaction,
    Input,
    SpriteAnimation,
} from "../components/index"


export function createAnimatedSprite(world, scene, assets, configs) {
    const { 
        imageName,
        x,
        y,
        z,
        baseHeight = 1,
        animation = {}, 
        interaction = {} 
    } = configs;


    const originalTexture = assets.getTexture(imageName);
    const texture = originalTexture.clone();
    texture.needsUpdate = true;
    texture.premultiplyAlpha = true;

    texture.repeat.set(1 / configs.animation.columns, 1 / configs.animation.rows); // frame


    const frameWidth = texture.image.width / configs.animation.columns;
    const frameHeight = texture.image.height / configs.animation.rows;
    const aspectRatio = frameWidth / frameHeight;

    const finalHeight = baseHeight;
    const finalWidth = baseHeight * aspectRatio;


    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);

    scene.add(sprite);
    // console.log(sprite)

//  ==-=-=-=-=-== ECS ==-=-=-=-=-==
    const entity = world.createEntity();

    world.addComponent(entity, new Input()); 
    world.addComponent(entity, new Transform(x, y, z)); 
    world.addComponent(entity, new Interaction(interaction));
    world.addComponent(entity, new Mesh2D(finalWidth, finalHeight)); 
    world.addComponent(entity, new ThreeView(sprite)); 
    world.addComponent(entity, new SpriteAnimation(animation)); 

    return entity;
}