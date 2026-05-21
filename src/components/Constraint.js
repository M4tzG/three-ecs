import { Component } from "../ecs/Component";


export class Constraint extends Component {

    constructor(entityA, entityB, distance) {
        super();
        this.entityA = entityA;
        this.entityB = entityB;
        this.distance = distance;
    }
}