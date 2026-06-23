import { createSprite } from "../factories/createSprite";
import { createPlayer } from "../factories/createPlayer";
// import { createPostProcessing } from "../factories/createPostProcessing";
// import { createAnimatedSprite } from "../factories/createAnimatedSprite";
// import { createChain } from "../factories/createChain";
// import { createExemple } from "../factories/createExemple";
// import { createCamera } from "../factories/createCamera";

export function runScene(world, scene, assets, data)  {
    

    data.sprites?.forEach(config => createSprite(world, scene, assets, config));
    data.player?.forEach(config => createPlayer(world, scene, assets, config));
    // data.animatedSprites?.forEach(config => createAnimatedSprite(world, scene, assets, config));
    // data.verlet?.forEach(config => createChain(world, scene, assets, config));
    // data.example?.forEach(config => createExemple(scene));
}