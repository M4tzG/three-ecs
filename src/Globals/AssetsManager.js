import * as THREE from "three"


export class AssetsManager {
    constructor (){
        this.textures = {};

        this.textureLoader = new THREE.TextureLoader();
    }

    getTexture(name) {
        return this.textures[name];
    }


    async loadAssets(assetsToLoad) {
    
        const loadPromises = assetsToLoad.map(([name, path]) =>
            this._loadTexture(name, path)
        );
        try {
            await Promise.all(loadPromises);
            console.log("assets carregados:", this.textures);
        } catch (error) {
            console.error("assets erro", error);
            throw error;
        }
    
    }

    _loadTexture(name, url) {
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


    
    dispose(){
        console.log("assets")
        for (const key in this.textures) {
            this.textures[key].dispose();
        }
    }
}