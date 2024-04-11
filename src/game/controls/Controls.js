import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Game from "../Game";

export default class Controls {
    constructor() {
        this.game = new Game();
        this.camera = this.game.camera.camera;
        this.RAPIER = this.game.Physics.RAPIER;
        this.physicsWorld = this.game.Physics.world;
        this.target = new THREE.Vector3();
        this.rotateAngle = new THREE.Vector3(0, 1, 0);
        this.desiredTranslation = new THREE.Vector3();
        this.keysPressed = {};
        this.playControlsRun = false;
        this.rotateQuarternion = new THREE.Quaternion();
        this.DIRECTIONS = ['w', 'a', 's', 'd'];
        this.currentAction = 'idie';
        this.toggleRun = false;

        this.desiredTranslation = new THREE.Vector3();
        this.walkDirection = new THREE.Vector3();
        this.openfs = new THREE.Vector3(0, 15.586213111877441, -68.7693862915039);

        this.ray = new this.RAPIER.Ray(
            { x: 0, y: 0, z: 0 },
            { x: 0, y: -1, z: 0 }
        );
        this.lerp = (x, y, a) => x * (1 - a) + y * a;
        this.storedFall = 0;
        this.positionls = {};

        this.setOrbitControls();
        this.playControls();
    }

    setOrbitControls() {
        this.orbitControls = new OrbitControls(this.game.camera.camera, this.game.canvas);
        this.orbitControls.enablePan = false; //禁用摄像机平移
        this.orbitControls.maxDistance = 16;
        this.orbitControls.minDistance = 2;
    }

    playControls() {
        window.addEventListener('keydown', (e) => {
            this.playControlsRun = true;
            (this.keysPressed)[e.key.toLowerCase()] = true
        })
        window.addEventListener('keyup', (e) => {
            this.playControlsRun = false;
            (this.keysPressed)[e.key.toLowerCase()] = false
        })
    }

    playUpdate() {

    }

    directionOffset(keysPressed) {
        let directionOffset = 0 // w
        if (keysPressed['w']) {
            if (keysPressed['a']) {
                directionOffset = Math.PI / 4 // w+a
            } else if (keysPressed['d']) {
                directionOffset = - Math.PI / 4 // w+d
            }
        } else if (keysPressed['s']) {
            if (keysPressed['a']) {
                directionOffset = Math.PI / 4 + Math.PI / 2 // s+a
            } else if (keysPressed['d']) {
                directionOffset = -Math.PI / 4 - Math.PI / 2 // s+d
            } else {
                directionOffset = Math.PI // s
            }
        } else if (keysPressed['a']) {
            directionOffset = Math.PI / 2 // a
        } else if (keysPressed['d']) {
            directionOffset = - Math.PI / 2 // d
        }

        return directionOffset;
    }

    update() {
        // console.log(this.playControlsRun);
        const offsect = this.game.characterPhysics.offsect;
        let directionPressed = this.DIRECTIONS.some(key => this.keysPressed[key] == true);
        let toggleRun = this.keysPressed['shift'];
        let toggleF = this.keysPressed['f'];

        if (toggleF) {
            let directionPressed = this.game.InteractiveList.filter(m => m.visible === true)[0];
            if (directionPressed) {
                this.game.Interactive = true;
                let translation = {
                    x: 70.4608383178711,
                    y: 6,
                    z: 110.66502380371094
                };
                this.game.characterPhysics.characterBody.setNextKinematicTranslation(translation)

                this.game.character.position.x = translation.x;
                this.game.character.position.y = translation.y - offsect;
                this.game.character.position.z = translation.z;
                this.positionls = translation;
                this.walkDirection.x = this.walkDirection.y = this.walkDirection.z = 0;
                this.storedFall = 0;
                this.ray.origin.x = translation.x;
                this.ray.origin.y = translation.y;
                this.ray.origin.z = translation.z;

                this.game.camera.camera.position.set( 
                    translation.x, 
                    translation.y + 2,
                    translation.z + 10
                );
                
                const cameraPositionOffset = this.camera.position.sub(this.game.character.position);

                this.game.character.position.x = translation.x;
                this.game.character.position.y = translation.y - offsect;
                this.game.character.position.z = translation.z;

                this.camera.position.x = translation.x + cameraPositionOffset.x;
                this.camera.position.y = (translation.y + cameraPositionOffset.y) - offsect;
                this.camera.position.z = translation.z + cameraPositionOffset.z;

                this.target.copy(this.game.character.position);
                this.target.y += 1.5;
                this.orbitControls.target = this.target;
                this.orbitControls.update();
                this.game.sky.skyPosition.copy(translation);

                this.game.InteractiveList.map(m => {
                    m.CSS2DObject.style.opacity = 0;
                    m.visible = false;
                })

                setTimeout(() => {
                    this.game.Interactive = false;
                }, 0.2);
            }
        };
        if(this.game.Interactive) return;
        let play = '';
        if (directionPressed && toggleRun) {
            // run
            play = 'fastRun';
        } else if (directionPressed) {
            // walk
            play = 'run';
        } else {
            // idle
            play = 'idie';
        };
        if (this.currentAction != play) {
            const toPlay = this.game.characterAction.animations[play];
            const nowPlay = this.game.characterAction.animations[this.currentAction];

            // nowPlay.crossFadeFrom(toPlay,0.2, true)
            nowPlay.fadeOut(0.2);
            toPlay.reset().fadeIn(0.2).play();
            // crossFadeTo
            // this.game.characterAction.animations[play].play()
            this.currentAction = play;
        }

        this.game.characterAction.mixer.update(this.game.clockDelta);

        this.walkDirection.x = this.walkDirection.y = this.walkDirection.z = 0;

        let velocity = 2;

        if (this.currentAction != 'idie') {
            // let clock = this.game.clock.getDelta();
            // 计算相机朝向
            let angleYCameraDirection = Math.atan2(
                (this.camera.position.x - this.game.character.position.x),
                (this.camera.position.z - this.game.character.position.z)
            )

            //计算人物移动方向夹角
            let directionOffset = this.directionOffset(this.keysPressed)

            //旋转人物
            this.rotateQuarternion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset)
            this.game.character.quaternion.rotateTowards(this.rotateQuarternion, 0.2)

            // console.log(directionOffset);

            this.camera.getWorldDirection(this.walkDirection)
            this.walkDirection.y = 0
            this.walkDirection.normalize()
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)
            // console.log(this.walkDirection);

            // run/walk velocity
            velocity = this.currentAction == 'fastRun' ? 10 : 3;
        }

        const translation = this.game.characterPhysics.characterBody.translation();

        if (translation.y < -100) {
            this.game.characterPhysics.characterBody.setNextKinematicTranslation({
                x: 0,
                y: 10,
                z: 0
            });
        } else {
            this.walkDirection.y += this.lerp(this.storedFall, -9.81 * this.game.clockDelta, 0.10);
            this.storedFall = this.walkDirection.y;
            this.ray.origin.x = translation.x;
            this.ray.origin.y = translation.y;
            this.ray.origin.z = translation.z;
            let hit = this.physicsWorld.castRay(this.ray, 10, true, this.RAPIER.QueryFilterFlags.EXCLUDE_DYNAMIC);

            if (hit) {
                const point = this.ray.pointAt(hit.toi);
                let diff = translation.y - (point.y + offsect);
                if (diff <= 0.0) {
                    this.storedFall = 0;
                    this.walkDirection.y = this.lerp(0, Math.abs(diff), 0.5);
                }
            };
            this.walkDirection.x = this.walkDirection.x * velocity * this.game.clockDelta;
            this.walkDirection.z = this.walkDirection.z * velocity * this.game.clockDelta;

            this.desiredTranslation.set(
                translation.x + this.walkDirection.x,
                translation.y + this.walkDirection.y,
                translation.z + this.walkDirection.z
            )
            this.game.characterPhysics.characterController.computeColliderMovement(this.game.characterPhysics.characterCollider, this.desiredTranslation);
            let correctedMovement = this.game.characterPhysics.characterController.computedMovement();
            if (correctedMovement.x === 0 && correctedMovement.y === 0 && correctedMovement.z === 0) {
                this.game.characterPhysics.characterBody.setNextKinematicTranslation({
                    x: this.positionls.x,
                    y: this.positionls.y,
                    z: this.positionls.z
                });

                const cameraPositionOffset = this.camera.position.sub(this.game.character.position);

                this.game.character.position.x = this.positionls.x;
                this.game.character.position.y = this.positionls.y - offsect;
                this.game.character.position.z = this.positionls.z;

                this.camera.position.x = this.positionls.x + cameraPositionOffset.x;
                this.camera.position.y = (this.positionls.y + cameraPositionOffset.y) - offsect;
                this.camera.position.z = this.positionls.z + cameraPositionOffset.z;

                this.target.copy(this.game.character.position);
                this.target.y += 1.5;
                this.orbitControls.target = this.target;
                this.orbitControls.update();
                this.game.sky.skyPosition.copy(this.positionls);
            } else {
                this.positionls = translation;
                this.game.characterPhysics.characterBody.setNextKinematicTranslation({
                    x: translation.x + this.walkDirection.x,
                    y: translation.y + this.walkDirection.y,
                    z: translation.z + this.walkDirection.z
                });

                const cameraPositionOffset = this.camera.position.sub(this.game.character.position);

                this.game.character.position.x = translation.x;
                this.game.character.position.y = translation.y - offsect;
                this.game.character.position.z = translation.z;

                this.camera.position.x = translation.x + cameraPositionOffset.x;
                this.camera.position.y = (translation.y + cameraPositionOffset.y) - offsect;
                this.camera.position.z = translation.z + cameraPositionOffset.z;

                this.target.copy(this.game.character.position);
                this.target.y += 1.5;
                this.orbitControls.target = this.target;
                this.orbitControls.update();
                this.game.sky.skyPosition.copy(translation);

                //判断当前距离是否可交互
                if (this.playControlsRun) {
                    this.game.InteractiveList.map(m => {
                        let distancef = m.position.distanceTo(this.game.character.position);
                        if (distancef <= 18) {
                            // this.game.Interactive = true;
                            m.CSS2DObject.style.opacity = 1;
                            m.visible = true;
                        } else {
                            // this.game.Interactive = false;
                            m.CSS2DObject.style.opacity = 0;
                            m.visible = false;
                        }
                    })
                }
            }
        }
    }
}