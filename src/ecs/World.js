import { Query } from "../utils/Query";

export class World {
    constructor(){

        this.nextEntityId = 0;
        this.entities = new Set();
        this.components = new Map();  // keys : value 
                                    // component class : maps entity ids to component instances

        this.systems = [];
    }

    createEntity() {
        const id = this.nextEntityId++;
        this.entities.add(id);
        return id;
    }
    
    addComponent(entity, component) {
        const type = component.constructor;
        if (!this.components.has(type)){
            this.components.set(type, new Map());
        }
        this.components.get(type).set(entity, component);

        Query.invalidateCache(this);
    }

    removeComponent(entity, componentType) {
        const componentMap = this.components.get(componentType);
        if (componentMap) {
            componentMap.delete(entity);
            Query.invalidateCache(this); 
        }
    }
    
    getComponent(entity, componentType) {
        const componentMap = this.components.get(componentType);
        return componentMap ? componentMap.get(entity) : undefined;
    }

    hasComponent(entity, componentType) {
        const componentMap = this.components.get(componentType);
        return componentMap ? componentMap.has(entity) : false
    }

    addSystem(system){
        this.systems.push(system);
    }

    update(deltaTime){
        // console.log("aq");
        for (const system of this.systems) {
            system.update(this, deltaTime);
        }
    }

    dispose() {
        // Destroi todas as entidades
        for (const entity of this.entities) {
            this.destroyEntity(entity);
        }

        // Limpa systems
        for (const system of this.systems) {
            if (system.dispose) {
                system.dispose();
            }
        }
        // Clear collections
        this.entities.clear();
        this.components.clear();
        this.systems = [];
    }

    destroyEntity(entity) {
        const entity_obj = entity;
        for (const componentMap of this.components.values()) {
            componentMap.delete(entity_obj);
        }

        this.entities.delete(entity);
    }
}