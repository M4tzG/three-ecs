import Engine from "../src/Engine.js";
const canvas = document.getElementById("app")

const engine = new Engine(canvas);

await engine.init([
    ["kitty", "/assets/kitty.png"]
]);

