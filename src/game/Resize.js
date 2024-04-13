import Game from "./Game"
export default class Resize {
    constructor() {
        this.game = new Game();
        this.camera = this.game.camera.camera;
        this.resize();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        // this.smallestSide = this.width < this.height ? this.width : this.height
        // this.biggestSide = this.width > this.height ? this.width : this.height
        this.pixelRatio = window.devicePixelRatio;
        this.clampedPixelRatio = Math.min(this.pixelRatio, 2);
    }

    update() {
        this.game.renderer.setSize(window.innerWidth, window.innerHeight);
        this.game.labelRenderer.setSize(window.innerWidth, window.innerHeight);

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}