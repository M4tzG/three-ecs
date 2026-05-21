import * as THREE from "three";

import {
    Transform,
    Mesh2D,
    ThreeView,
    Interaction,
    Input,
} from "../components/index"


export function createSprite(world, scene, assets, configs) {
    const {
        imageName,
        baseHeight = 1,
        transform = {},
        interaction = {},
    } = configs;
    
    const texture = assets.getTexture(imageName);

    if (!texture) {
        console.error(`createSprite: "${imageName}" not found`);
        return null;
    }

    // console.log(`Creating sprite: ${imageName}`, texture);

    texture.premultiplyAlpha = true;


    const imageWidth = texture.image.width;
    const imageHeight = texture.image.height;
    const aspectRatio = imageWidth / imageHeight;

    const finalHeight = baseHeight;
    const finalWidth = baseHeight * aspectRatio;


    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.5 });
    const sprite = new THREE.Sprite(material);

    scene.add(sprite);



//  ==-=-=-=-=-== ECS ==-=-=-=-=-==
    const entity = world.createEntity();

    world.addComponent(entity, new Input()); 
    world.addComponent(entity, new Transform(transform)); 
    world.addComponent(entity, new Interaction(interaction));
    world.addComponent(entity, new Mesh2D(finalWidth, finalHeight)); 
    world.addComponent(entity, new ThreeView(sprite)); 

    return entity;
}