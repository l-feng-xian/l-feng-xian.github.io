import * as THREE from 'three';
import EmitBus from '../../untils/emitBus';
import Game from '../Game';
// import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat';
export default class Physics {
    constructor() {
        this.game = new Game();
        this.world = null;
        this.RAPIER = null;
        this.addPhysics();
        this.addPhysicsDebug();
        this.showPhysicsDebugWF = false;
    }

    addPhysics() {
        import('@dimforge/rapier3d').then(RAPIER => {
            let gravity = { x: 0.0, y: -9.81, z: 0.0 };
            this.world = new RAPIER.World(gravity);
            this.RAPIER = RAPIER;
            EmitBus.emit("addPhysicsed");
        })
        // RAPIER.init().then(() => {
        //     let gravity = { x: 0.0, y: -9.81, z: 0.0 };
        //     this.world = new RAPIER.World(gravity);
        //     this.RAPIER = RAPIER;
        //     EmitBus.emit("addPhysicsed");
        // });
    }

    addPhysicsDebug() {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial(
            { color: '#0000ff', vertexColors: true }
        )
        this.physicsDebugWF = new THREE.Line(geometry, material);
        this.game.scene.add(this.physicsDebugWF)
    }

    update() {
        this.world.step();
        if (this.showPhysicsDebugWF) {
            const { vertices, colors } = this.world.debugRender()
            this.physicsDebugWF.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
            this.physicsDebugWF.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4))
        }
    }
}

