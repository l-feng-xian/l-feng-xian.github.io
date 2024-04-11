import * as THREE from 'three';
import Game from '../Game';

import resourcesList from './resourcesList';
import gameScheduleList from './gameScheduleList';
import EmitBus from '../../untils/emitBus';
import AddPhysiceModel from '../physics/AddPhysiceModel';
import AddMash from './AddModels';

export default class Load {
    constructor() {
        this.game = new Game();
        this.scene = this.game.scene;
        this.RAPIER = this.game.Physics.RAPIER;
        this.physicsWorld = this.game.Physics.world;
        this.addPhysiceModel = new AddPhysiceModel(this.RAPIER, this.physicsWorld);
        this.AddModels = new AddMash(this.scene, this.RAPIER, this.physicsWorld, this.game.textureLoader, this.game.gltfLoader);
        this.resourcesList = resourcesList();
        this.gameScheduleList = gameScheduleList();
        this.textureLoader = this.game.textureLoader;
        this.gltfLoader = this.game.gltfLoader;
        this.grassGeometry = new THREE.BufferGeometry();
        this.physicsBodyList = [];
        this.currentModel = this.gameScheduleList[this.game.gameSchedule];

        this.Uniforms = {
            uTime: { value: 0 },
            color: { value: new THREE.Color("#0000ff") }
        };

        this.textures = {};

        this.addmodel();
    }

    addmodel() {
        const Models = this.resourcesList.filter(f => f.load);
        const texture = this.textureLoader.load("/树叶1.png");

        let loadMoadList = [];

        Models.map(m => {
            if (m.type === "mash") {
                if (m.physicsModel === "ball") {
                    loadMoadList.push(this.AddModels.addBall(m));
                } else if (m.physicsModel === "cuboid") {
                    loadMoadList.push(this.AddModels.addcuboid(m));
                }
            } else if (m.type === "gltf") {
                loadMoadList.push(this.AddModels.addGltf(m, texture));
            }
        })

        Promise.all(loadMoadList).then((res) => {
            this.physicsBodyList = res.filter(f => f.type === "dynamic");
            this.ModelList = res.filter(f => f.type === "fixed");

            this.gltfModel = this.ModelList[0].model;
            this.ColliderList = this.ModelList[0].ColliderList;
            this.game.InteractiveList = this.ModelList[0].InteractiveList;
            // console.log(this.game.InteractiveList);
            this.gameScheduleToAdd(this.game.gameSchedule)
            this.addCharacter();
        })
    }

    //控制模型显示隐藏
    gameScheduleToAdd(gameSchedule) {
        // scene.remove
        // console.log(this.gameScheduleList[gameSchedule], this.scene, this.gltfModel, 'xxxs');
        let activeGameSchedule = this.gameScheduleList[gameSchedule];
        // console.log(this.currentModel, 'this.currentModel');
        return;
        this.gltfModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {

                if (activeGameSchedule.includes(child.name)) {
                    child.visible = true;
                    if (!this.currentModel.includes(child.name)) {
                        console.log(child.name);
                        this.physicsWorld.createCollider(this.ColliderList[child.name].groundCollider, this.ColliderList[child.name].groundBody);
                    }
                } else {
                    console.log(child.name, '===gameScheduleToAdd-false');
                    // 获取对要移除的对象的引用
                    let object = scene.getObjectByName(child.name);
                    // 从场景中移除对象
                    this.scene.remove(object);
                    // 可选：进行一些清理工作
                    object.dispose();

                    child.visible = false;
                    let childType = child.name.split('_')[1] ? child.name.split('_')[1] : 'undf';
                    if (childType === 'g') {
                        console.log(child.name);
                        this.physicsWorld.removeCollider(this.ColliderList[child.name].Collider, true);
                    }
                }
            }
        })
    }

    addCharacter() {
        this.gltfLoader.load("/man1.glb", (gltf) => {
            gltf.scene.traverse((child) => {
                child.castShadow = true;
                child.receiveShadow = true;
            })

            let animations = {}
            const mixer = new THREE.AnimationMixer(gltf.scene);
            this.game.characterAction.mixer = mixer
            gltf.animations.map((m) => {
                animations[m.name] = mixer.clipAction(m)
            })
            // console.log(animations);
            // gltf.scene.position.set(0, 3, 0);
            gltf.scene.position.set(0, 10, 0);
            this.game.character = gltf.scene;
            this.game.characterAction.animations = animations;
            this.game.characterAction.animations['idie'].play();
            this.scene.add(this.game.character);

            const bodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 10, 0)
            const characterBody = this.physicsWorld.createRigidBody(bodyDesc);
            const dynamicCollider = this.RAPIER.ColliderDesc.capsule(0.6, 0.6);
            const characterCollider = this.physicsWorld.createCollider(dynamicCollider, characterBody);

            let characterController = this.physicsWorld.createCharacterController(1);
            this.game.characterPhysics = { characterBody: characterBody, characterCollider: characterCollider, offsect: 1, characterController: characterController };
            this.game.sky.directionalLight.target = this.game.character;

            this.game.camera.camera.position.set(
                gltf.scene.position.x,
                gltf.scene.position.y + 2,
                gltf.scene.position.z + 10
            )
            EmitBus.emit('characterLoaded');
            this.game.LoadingCompleted = true;
        })
    }

    update() {
        // console.log(this.game.characterPhysics.characterBody.translation());
        for (let i = 0; i < this.physicsBodyList.length; i++) {
            let physicsBody = this.physicsBodyList[i];
            physicsBody.model.position.copy(physicsBody.rigidBody.translation());
            physicsBody.model.setRotationFromQuaternion(physicsBody.rigidBody.rotation());
        }

        this.AddModels.update(this.game.clockDelta);
    }
}