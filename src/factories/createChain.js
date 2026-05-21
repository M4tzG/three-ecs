import * as THREE from "three";

import {
    Transform,
    VerletNode,
    Constraint,
    ThreeView,
    Interaction,
    Input,
    Gravity,
} from "../components/index"



const visualCacheOdd = new Map();
const visualCacheEven = new Map();

export function disposeChainCaches() {
    visualCacheOdd.forEach(set => {
        set.geometry.dispose();
        set.material.dispose();
    });
    visualCacheOdd.clear();
    
    visualCacheEven.forEach(set => {
        set.geometry.dispose();
        set.material.dispose();
    });
    visualCacheEven.clear();
}

function getOddVisualSet(assets, baseHeight) {
    const cacheKey = `chainLinkOdd_${baseHeight}`;
    
    if (visualCacheOdd.has(cacheKey)) {
        return visualCacheOdd.get(cacheKey);
    }

    const matOptions = { 
        transparent: true, 
        side: THREE.DoubleSide, 
        depthWrite: false, 
        alphaTest: 0.5 
    };

    const texFull = assets.getTexture("chainLinkOddFull");
    texFull.minFilter = THREE.NearestFilter;
    texFull.magFilter = THREE.NearestFilter;
    texFull.premultiplyAlpha = true;

    const geoFull = new THREE.PlaneGeometry(
        baseHeight * (texFull.image.width / texFull.image.height), 
        baseHeight
    );

    const visualSet = { 
        geometry: geoFull, 
        material: new THREE.MeshBasicMaterial({ map: texFull, ...matOptions }) 
    };

    visualCacheOdd.set(cacheKey, visualSet);
    return visualSet;
}

function getEvenVisualSet(assets, baseHeight) {
    const cacheKey = `chainLinkEven_${baseHeight}`;
    
    if (visualCacheEven.has(cacheKey)) {
        return visualCacheEven.get(cacheKey);
    }

    const matOptions = { 
        transparent: true, 
        side: THREE.DoubleSide, 
        depthWrite: false, 
        alphaTest: 0.5 
    };

    const texBack = assets.getTexture("chainLinkEvenBack");
    const texFront = assets.getTexture("chainLinkEvenFront");

    [texBack, texFront].forEach(tex => {
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.premultiplyAlpha = true;
    });

    const geoEven = new THREE.PlaneGeometry(
        baseHeight * (texFront.image.width / texFront.image.height), 
        baseHeight
    );

    const visualSet = { 
        geometry: geoEven, 
        matBack: new THREE.MeshBasicMaterial({ map: texBack, ...matOptions }), 
        matFront: new THREE.MeshBasicMaterial({ map: texFront, ...matOptions }) 
    };

    visualCacheEven.set(cacheKey, visualSet);
    return visualSet;
}

function createLinkMesh(isOdd, oddVisual, evenVisual, scale) {
    let linkVisual;

    if (isOdd) {
        linkVisual = new THREE.Mesh(oddVisual.geometry, oddVisual.material);
        linkVisual.renderOrder = 2;
    } else {
        linkVisual = new THREE.Group();

        const meshBack = new THREE.Mesh(evenVisual.geometry, evenVisual.matBack);
        meshBack.renderOrder = 1;

        const meshFront = new THREE.Mesh(evenVisual.geometry, evenVisual.matFront);
        meshFront.renderOrder = 3;

        linkVisual.add(meshBack);
        linkVisual.add(meshFront);
    }

    linkVisual.scale.set(scale, scale, scale);
    return linkVisual;
}

export function createChain (world, scene, assets, configs) {
    const {
        baseHeight = 1,
        transform = {},
        interaction = {},
        chainConfig = {}
    } = configs;

    const oddVisual = getOddVisualSet(assets, baseHeight);
    const evenVisual = getEvenVisualSet(assets, baseHeight);

    const totalDistance = chainConfig.startPos.distanceTo(chainConfig.endPos);
    const linkDistance = totalDistance / chainConfig.numLinks;

    let previousEntity = null;
    let previousNode = null;
        


    for (let i = 0; i < chainConfig.numLinks; i++) {
        const isOdd = (i % 2 !== 0);
        const spawnPercent = i / chainConfig.numLinks;
        const spawnPos = new THREE.Vector3().lerpVectors(chainConfig.startPos, chainConfig.endPos, spawnPercent);
        const isPinned = (i === 0 || i === chainConfig.numLinks - 1);

        const linkVisual = createLinkMesh(isOdd, oddVisual, evenVisual, chainConfig.scale);
        scene.add(linkVisual);

        const linkEntity = world.createEntity();
        world.addComponent(linkEntity, new VerletNode(spawnPos.x, spawnPos.y, spawnPos.z, isPinned));
        world.addComponent(linkEntity, new Gravity(chainConfig.gravity));
        world.addComponent(linkEntity, new ThreeView(linkVisual, isOdd));
        world.addComponent(linkEntity, new Transform(transform));
        world.addComponent(linkEntity, new Input());
        world.addComponent(linkEntity, new Interaction(interaction));

        if (previousEntity !== null) {
            const constraintEntity = world.createEntity();
            world.addComponent(constraintEntity, new Constraint(previousEntity, linkEntity, linkDistance));
            previousNode.nextNode = world.getComponent(linkEntity, VerletNode);
        }

        previousEntity = linkEntity;
        previousNode = world.getComponent(linkEntity, VerletNode);
    }
}