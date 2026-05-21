import { Component } from "../ecs/Component";


export class SpriteAnimation extends Component {
    constructor(animConfig = {}) {
        super();
        this.rows = animConfig.rows;
        this.columns = animConfig.columns;

        this.totalFrames = animConfig.totalFrames;

        this.frameTime = 1 / animConfig.fps;
        this.timer = 0;
        this.currentFrame = 0;
    }
}