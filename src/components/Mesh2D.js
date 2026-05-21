import { Component } from "../ecs/Component";

export class Mesh2D extends Component {

    constructor(width, height){
        super();
        this.width = width;
        this.height = height;
    }
}