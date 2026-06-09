// src/components/RectHitbox.js
import { Component } from "../ecs/Component";
import { Layers } from "../constants/CollisionLayers.js";

export class RectHitbox extends Component {
    constructor(width, height, layerString, maskArray = ["sprite"]) {
        super();
        this.width = width;
        this.height = height;
        // console.log(this.width, this.height)

        this.layer = Layers[layerString] || Layers["default"];

        this.mask = 0;
        maskArray.forEach(maskString => {
            if (Layers[maskString]) {
                this.mask = this.mask | Layers[maskString];
            }
        });

        this.debugMesh = null;
    }
}