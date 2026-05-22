export class Query {

    static entitiesWith(world, ...componentClasses) {
        const key = componentClasses.map(c => c.name).join(',');

        if (world._queryCache?.has(key)) {
            return world._queryCache.get(key);
        }

        const result = [...world.entities].filter(entity =>
            componentClasses.every(componentClass =>
                world.getComponent(entity, componentClass)
            )
        );

        if (!world._queryCache) world._queryCache = new Map();
        world._queryCache.set(key, result);

        return result;
    }

    static invalidateCache(world) {
        if (world._queryCache) world._queryCache.clear();
    }
}