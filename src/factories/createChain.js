import * as THREE from "three";

import {
    VerletNode,
    Constraint,
    ChainLink,
    CircleHitbox,
    MouseInteraction
} from "../components/index";


const visualCacheOdd  = new Map();
const visualCacheEven = new Map();

export function disposeChainCaches() {
    visualCacheOdd.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
    });
    visualCacheOdd.clear();

    visualCacheEven.forEach(({ geometry, matBack, matFront }) => {
        geometry.dispose();
        matBack.dispose();
        matFront.dispose();
    });
    visualCacheEven.clear();
}

// ─── Helpers de cache ────────────────────────────────────────────────────────

function getOddVisualSet(assets, baseHeight) {
    const key = `odd_${baseHeight}`;
    if (visualCacheOdd.has(key)) return visualCacheOdd.get(key);

    const tex = assets.getTexture("imageFull");
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.premultiplyAlpha = true;

    const set = {
        geometry: new THREE.PlaneGeometry(
            baseHeight * (tex.image.width / tex.image.height),
            baseHeight
        ),
        material: new THREE.MeshBasicMaterial({
            map: tex, transparent: true,
            side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.5
        })
    };

    visualCacheOdd.set(key, set);
    return set;
}

function getEvenVisualSet(assets, baseHeight) {
    const key = `even_${baseHeight}`;
    if (visualCacheEven.has(key)) return visualCacheEven.get(key);

    const texBack  = assets.getTexture("imageBottom");
    const texFront = assets.getTexture("imageTop");

    [texBack, texFront].forEach(t => {
        t.minFilter = THREE.NearestFilter;
        t.magFilter = THREE.NearestFilter;
        t.premultiplyAlpha = true;
    });

    const geo = new THREE.PlaneGeometry(
        baseHeight * (texFront.image.width / texFront.image.height),
        baseHeight
    );

    const set = {
        geometry: geo,
        matBack:  new THREE.MeshBasicMaterial({ map: texBack,  transparent: true, side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.5 }),
        matFront: new THREE.MeshBasicMaterial({ map: texFront, transparent: true, side: THREE.DoubleSide, depthWrite: false, alphaTest: 0.5 }),
    };

    visualCacheEven.set(key, set);
    return set;
}

// ─── createLinkMesh ───────────────────────────────────────────────────────────

function createLinkMesh(isOdd, oddVisual, evenVisual, scale) {
    let mesh;

    if (isOdd) {
        mesh = new THREE.Mesh(oddVisual.geometry, oddVisual.material);
        mesh.renderOrder = 2;
    } else {
        mesh = new THREE.Group();

        const back  = new THREE.Mesh(evenVisual.geometry, evenVisual.matBack);
        back.renderOrder = 1;

        const front = new THREE.Mesh(evenVisual.geometry, evenVisual.matFront);
        front.renderOrder = 3;

        mesh.add(back, front);
    }

    mesh.scale.setScalar(scale);
    return mesh;
}

// ─── createChain ─────────────────────────────────────────────────────────────

export function createChain(world, scene, assets, configs) {
    const {
        baseHeight  = 1,
        chainConfig = {}
    } = configs;

    const {
        startPos,
        endPos,
        isPinnedEnd = true,
        numLinks    = 10,
        scale       = 1,
    } = chainConfig;

    if (!startPos || !endPos) {
        console.error("createChain: chainConfig.startPos e chainConfig.endPos são obrigatórios");
        return;
    }

    const oddVisual  = getOddVisualSet(assets, baseHeight);
    const evenVisual = getEvenVisualSet(assets, baseHeight);

    const totalDistance = startPos.distanceTo(endPos);
    const linkDistance  = totalDistance / numLinks;

    let previousEntity = null;
    let previousNode   = null;

    for (let i = 0; i < numLinks; i++) {
        const isOdd        = (i % 2 !== 0);
        const spawnPercent = i / numLinks;
        const spawnPos     = new THREE.Vector3().lerpVectors(startPos, endPos, spawnPercent);

        const isPinned = (i === 0) || (i === numLinks - 1 && isPinnedEnd);

        // ── Mesh visual
        const mesh = createLinkMesh(isOdd, oddVisual, evenVisual, scale);
        scene.add(mesh);

        // ── Entidade ECS
        const entity = world.createEntity();
        world.addComponent(entity, new VerletNode(spawnPos.x, spawnPos.y, spawnPos.z, isPinned));
        world.addComponent(entity, new ChainLink(mesh, isOdd));
        

        const hitRadius = (baseHeight * scale) / 1.5; 
        
        
        world.addComponent(entity, new CircleHitbox(hitRadius, "default", [])); 
        
        world.addComponent(entity, new MouseInteraction({ 
            isHoverable: true, 
            canDragged: true 
        }));
        // ==========================================

        if (previousEntity !== null) {
            const constraintEntity = world.createEntity();
            world.addComponent(constraintEntity, new Constraint(previousEntity, entity, linkDistance));
            previousNode.nextNode = world.getComponent(entity, VerletNode);
        }

        previousEntity = entity;
        previousNode   = world.getComponent(entity, VerletNode);
    }
}