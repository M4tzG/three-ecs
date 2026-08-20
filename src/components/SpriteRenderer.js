import { Component } from "../ecs/Component";

export class SpriteRenderer extends Component{
    constructor(obj, width, height){
        super();
        this.obj = obj;
        this.width = width;
        this.height = height;
        this.aspectRatio = this.width / this.height;
    }
}