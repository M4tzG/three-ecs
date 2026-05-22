import { Component } from "../ecs/Component";
import * as THREE from "three";

export class Transform extends Component {
    constructor(configs = {}) {
        super();

        this.position = new THREE.Vector3(
            Number.isFinite(configs.px) ? configs.px : 0,
            Number.isFinite(configs.py) ? configs.py : 0,
            Number.isFinite(configs.pz) ? configs.pz : 0
        );

        this.rotation = new THREE.Vector3(
            Number.isFinite(configs.rx) ? configs.rx : 0,
            Number.isFinite(configs.ry) ? configs.ry : 0,
            Number.isFinite(configs.rz) ? configs.rz : 0
        );

        this.scale = Number.isFinite(configs.scale) ? configs.scale : 1;
    }
}