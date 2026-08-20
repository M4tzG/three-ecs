import { Component } from "../ecs/Component";

export class ChainLink extends Component {

    constructor(mesh, isOdd = false) {
        super();
        this.mesh  = mesh;
        this.isOdd = isOdd;
    }
}
 