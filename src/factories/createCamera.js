// Exemplo de como você montaria a entidade Câmera
import * as THREE from 'three';
import { Transform, Camera } from '../components/index';


export function createCamera(world, configs) {
    const { 
        transform = {},
    } = configs;

    let threeCamera;
    if (configs.type === 'orthographic') {
        threeCamera = new THREE.OrthographicCamera(
            configs.left, configs.right, configs.top, configs.bottom, configs.near, configs.far
        );
    } else {
        threeCamera = new THREE.PerspectiveCamera(
            configs.fov, configs.aspect, configs.near, configs.far
        );
    }

    const entity = world.createEntity();
    
    const cameraComp = new Camera(threeCamera, configs.lookAt);
    world.addComponent(entity, cameraComp);
    world.addComponent(entity, new Transform(transform));

    return entity;
}