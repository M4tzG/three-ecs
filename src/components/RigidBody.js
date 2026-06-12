import { Component } from "../ecs/Component";
import * as THREE from "three";

export class RigidBody extends Component {

    constructor(configs = {}) {
        super();
        this.bodyType = configs.bodyType;
        // console.log(this.bodyType)
        this.mass = configs.mass ? configs.mass : 0;
        this.velocity = configs.velocity ? configs.velocity : new THREE.Vector3();

        this.invMass = this.mass > 0 ? 1 / this.mass : 0; 
    }
}