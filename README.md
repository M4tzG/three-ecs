# Three ECS

An ECS-based game engine using [Three.js](https://threejs.org/).

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, start the development server:

```bash
npm run dev
```

The development server opens the `example` scene.

## Basic Usage

Create an `Engine` and initialize it with your assets:

```js
import Engine from "./src/Engine.js";

const canvas = document.getElementById("app");
const engine = new Engine(canvas);

await engine.init([
  ["player", "/assets/player.png"],
]);

engine.initScene({
  player: [{
    imageName: "player",
    transform: {
      px: 0,
      py: 0,
      pz: 0,
      scale: 5
    }
  }]
}, (world, scene, engineRefs) => {
  // Add systems here
});
```

Systems can be added to a scene through the `world`.

For a complete example, see the [`example`](./example) folder.
