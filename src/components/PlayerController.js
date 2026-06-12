import { Component } from "../ecs/Component";


export class PlayerController extends Component{
    constructor(controller) {
        super();
        this.speed = controller.speed ?? 50;
        this.jumpForce = controller.jumpForce ?? 200;
        
        this.isGrounded = true; 
        this.currentState = 'IDLE'; // pode ser 'WALK', 'JUMP', 'FALL', etc.
        this.facingRight = true;   // flip horizontal
    }
}