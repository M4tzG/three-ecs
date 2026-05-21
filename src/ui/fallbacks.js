    // falbavk caaso n tenha webGL...
export function showNoWebGLFallback() {

    const warningDiv = document.createElement('div');
    warningDiv.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        background-color: #111; color: white; font-family: sans-serif; text-align: center;
        padding: 20px; box-sizing: border-box; z-index: 9999;
    `;
    warningDiv.innerHTML = `
        <h2>Ops! Seu navegador não suporta WebGL 😢</h2>
    `;
    
    document.body.appendChild(warningDiv);
}
