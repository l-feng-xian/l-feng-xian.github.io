import * as THREE from 'three';
import Game from './Game';
import EmitBus from '../untils/emitBus';
export default class Camera {
    constructor() {
        this.game = new Game();
        this.scene = this.game.scene;
        this.setCamera();
    }

    setCamera() {
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.scene.add(this.camera);
        // EmitBus.once("characterLoaded", () => {
        //     this.camera.position.x = 0;
        //     this.camera.position.y = 12;
        //     this.camera.position.z = 10;
        // })
    }

    update() {

    }
}