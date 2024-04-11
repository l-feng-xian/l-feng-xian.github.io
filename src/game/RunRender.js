import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
import Game from './Game';
export default class RunRender {
    constructor() {
        this.game = new Game()

        this.clock = new THREE.Clock();

        this.setStats()
        this.loopRender()

        window.addEventListener('resize', () => {
            this.game.resize.update()
        })
    }

    setStats() {
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom)
    }

    loopRender() {
        requestAnimationFrame(() => {
            this.update();
            this.game.renderer.render(this.game.scene, this.game.camera.camera);
            // this.game.composer.render();
            this.game.labelRenderer.render(this.game.scene, this.game.camera.camera);
            this.loopRender()
        });

    }
    update() {
        this.game.clockDelta = this.clock.getDelta();
        // console.log(this.game.clockDelta*1000);
        this.stats.update();
        if (this.game.LoadingCompleted) {
            this.game.Physics.update();
            this.game.load.update();
            this.game.controls.update();
            this.game.sky.update()
            // console.log(this.game.load.rigidBody.translation());
        }
    }
}
