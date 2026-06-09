import { Component } from "../ecs/Component";
import { Layers } from "../constants/CollisionLayers.js";

export class CircleHitbox extends Component {
    constructor(radius, layerString, maskArray = ["sprite"]){
        super();
        this.radius = radius;
        console.log(radius)
        
        // converte a str para o numero correspondente
        this.layer = Layers[layerString] || Layers["default"];

        this.mask = 0;
        maskArray.forEach(maskString => {
            if (Layers[maskString]) {
                this.mask = this.mask | Layers[maskString]; // junta os numeros com bitwise OR
            }
        });

        this.debugMesh = null;

    }
}