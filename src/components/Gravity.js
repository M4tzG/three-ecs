import { Component } from "../ecs/Component";
import * as THREE from "three"

export class Gravity extends Component {

    constructor(force = 9.8) {
        super();
        this.force = new THREE.Vector3(0, -force, 0);
    }
}