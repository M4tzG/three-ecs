import * as THREE from "three"


export default class AssetsManager {
    constructor (){
        this.textures = {};

        this.textureLoader = new THREE.TextureLoader();
    }

    loadTexture(name, url) {
        return new Promise((resolve, reject) => {

            this.textureLoader.load(
                url,
                (texture) => {

                    texture.colorSpace = THREE.SRGBColorSpace;

                    this.textures[name] = texture;

                    resolve(texture);
                },
                undefined,
                (err) => reject(err)
            );

        });
    }

    getTexture(name) {
        return this.textures[name];
    }
}