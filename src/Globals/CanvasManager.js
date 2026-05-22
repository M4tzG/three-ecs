import * as THREE from "three"
export class CanvasManager {
    constructor(canvas){
        this.webGL = this.checkWebGLSupport();
        this.canvas = canvas;
    }

    init(){
        if (!this.webGL) {
            console.error("sem WebGL");
            return;
        }

    }
    getCanvas(){
        return this.canvas;
    }
    getWidth(){
        return this.canvas.clientWidth;
    }
    getHeight(){
        return this.canvas.clientHeight;
    }

    dispose(){
        console.log("canvas")
        if (this.renderer) {
            this.renderer.dispose();
        }
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
}