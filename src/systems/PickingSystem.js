import { Interaction, 
        Input, 
        ThreeView, 
        VerletNode } from "../components/index";  

import { System } from "../ecs/System";
import { Query } from "../ecs/Query";



import * as THREE from "three";

export class PickingSystem extends System {

// [=============================================================]  
    // interaçao do mouse com determinado componente
// [=============================================================]  

    constructor(scene) {
        super();
        this.scene = scene;
        this.camera = null;
        this.raycaster = new THREE.Raycaster(); // verifica hover (ajustar dps)
        this.mouseVector = new THREE.Vector2();
        this._cachedData = null;
        
    }

    update(world, deltaTime) {
        this.camera = world.mainCamera;
        if (!this._cachedData) {
            const entities = Query.entitiesWith(world, Interaction, Input, ThreeView);
            this._cachedData = [];
            for (const e of entities) {
                const threeView = world.getComponent(e, ThreeView);
                const interaction = world.getComponent(e, Interaction);
                const input = world.getComponent(e, Input);
                const verlet = world.getComponent(e, VerletNode);
                this._cachedData.push({ threeView, interaction, input, verlet, entity: e });
            }
        }

        const interactableObjects = [];
        const objectToEntityMap = new Map();
        let mouseInput = null;

        for (const { threeView, interaction, input, entity } of this._cachedData) {
            
            if (!mouseInput) mouseInput = input;

            interaction.isHovered = false;
            interaction.isClicked = false;

            if (threeView.obj) {
                interactableObjects.push(threeView.obj);
                objectToEntityMap.set(threeView.obj, entity); 
            }
        }

        if (!mouseInput || interactableObjects.length === 0) return;


        this.mouseVector.set(mouseInput.mouse.x, mouseInput.mouse.y);
        this.raycaster.setFromCamera(this.mouseVector, this.camera);

        const intersects = this.raycaster.intersectObjects(interactableObjects, false);

        if (intersects.length > 0) {
            let entityHit = null; 
            
            for (let i = 0; i < intersects.length; i++) {
                const objectHit = intersects[i].object;
                const tempEntity = objectToEntityMap.get(objectHit);
                
                if (tempEntity !== undefined) {
                    // Find the interaction from cached data
                    const cachedItem = this._cachedData.find(item => item.entity === tempEntity);
                    if (cachedItem && cachedItem.interaction.isHoverable) {
                        entityHit = tempEntity;
                        break; 
                    }
                }
            }
            // faz a graça
            if (entityHit !== undefined) {
                const cachedItem = this._cachedData.find(item => item.entity === entityHit);
                if (cachedItem) {
                    cachedItem.interaction.isHovered = true;
                    if (cachedItem.verlet && !cachedItem.verlet.isPinned && cachedItem.interaction.isHoverable) {
                        // delta da mmovimentaçao do mouse
                        const moveX = cachedItem.input.mouse.deltaX || 0;
                        const moveY = cachedItem.input.mouse.deltaY || 0;

                        // console.log(moveY, moveX)

                        if (Math.abs(moveX) > 0 || Math.abs(moveY) > 0) {
                            
                            const pushMultiplier = 0.001; 
                            cachedItem.verlet.position.x += moveX * pushMultiplier;
                            cachedItem.verlet.position.y -= moveY * pushMultiplier; 
                        }
                    }
                }
            }
        }
        
        
    }
}