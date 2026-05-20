import * as THREE from "three"

export default class Engine {
    constructor(){
        this.test_text = "lalalalala";
    }
    test(){
        console.log(this.test_text)
    }


    criarRetangulo(container = document.body) {
        const scene = new THREE.Scene();

        const camera = new THREE.OrthographicCamera(
            -1,
            1,
            1,
            -1,
            0.1,
            10
        );

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);

        container.appendChild(renderer.domElement);

        const geometry = new THREE.PlaneGeometry(1, 1);

        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00
        });

        const rect = new THREE.Mesh(geometry, material);

        scene.add(rect);

        camera.position.z = 1;

        renderer.render(scene, camera);

        console.log("retangulo criado");
    }
}