import { Component } from "../ecs/Component";

export class Input extends Component {
    constructor() {
        super();
        this.mouse = {
            x: 0,
            y: 0,
            isDown: false,
            deltaX: 0,
            deltaY: 0,
            initialX: undefined,
            initialY: undefined
        };
        this.gyro = {
            x: 0,
            y: 0
        };
    }
}