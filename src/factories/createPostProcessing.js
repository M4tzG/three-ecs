import { PostProcessing } from "../components/index"

export function createPostProcessing(world, config = {}) {

    const entity = world.createEntity();
    world.addComponent(entity, new PostProcessing(config));

    return entity;
}