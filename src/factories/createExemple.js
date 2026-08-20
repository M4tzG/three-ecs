import * as THREE from "three"


export function createExemple(scene){
  // quadrado
  const geometry = new THREE.PlaneGeometry(2, 2);

  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00
  });

  const square = new THREE.Mesh(geometry, material);


  scene.add(square);
}
