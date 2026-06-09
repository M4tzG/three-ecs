import { Component } from "../ecs/Component";


export class MouseInteraction extends Component {
    constructor(configs = {}) {
        super();
        // onHold
        this.isMobile = configs.isMobile ?? false;
        
        this.isHovered = false; 
        this.isHoverable = configs.isHoverable ?? false;

        this.isDragged = false; // debug
        this.isDraggable = configs.canDragged ?? false;

        // -----------
        this.isClicked = false;
        this.isClickable = configs.canClicked ?? false;
        
        this.isParallaxed = configs.isParallaxed ?? false;
        this.parallaxFactor = configs.parallaxFactor ?? 1;


        
    }
}