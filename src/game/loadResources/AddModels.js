import * as THREE from 'three';
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";
import { GrassMaterial } from './GrassMaterial';
// import debugGui from "../debug/Debug";
import Tunnel from '../shaders/tunnel/Tunnel';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
export default class AddMash {
    constructor(scene, RAPIER, physicsWorld, textureLoader, gltfLoader) {
        this.scene = scene;
        this.RAPIER = RAPIER;
        this.physicsWorld = physicsWorld;
        this.grassMaterial = new GrassMaterial();
        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = textureLoader;
        this.gltfLoader = gltfLoader;
        this.heightmap_ = null;
        this.textures = {};
        this.Uniforms = {
            uTime: { value: 0 },
            uColorStart: '#c9ffeb',
            uColorEnd: '#b2e4ff'
        };
        this.TunnelMaterial = Tunnel();
    }

    addBall(m) {
        return new Promise((resolve, reject) => {
            const { size, position } = m;
            const geometry = new THREE.SphereGeometry(size.radius, size.widthSegments, size.heightSegments);
            const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(position.x, position.y, position.z);
            sphere.castShadow = m.castShadow;
            sphere.receiveShadow = m.receiveShadow;
            this.scene.add(sphere);

            let rigidBodyDesc = this.RAPIER.RigidBodyDesc.dynamic().setTranslation(position.x, position.y, position.z);
            let rigidBody = this.physicsWorld.createRigidBody(rigidBodyDesc);
            let colliderDesc = this.RAPIER.ColliderDesc.ball(size.radius);
            const Collider = this.physicsWorld.createCollider(colliderDesc, rigidBody);

            let data = {
                name: m.name,
                model: sphere,
                rigidBody: rigidBody,
                Collider: Collider,
                type: 'dynamic'

            };
            resolve(data);
        })
    }

    addcuboid(m) {
        return new Promise((resolve, reject) => {
            const { size, position } = m;
            const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
            const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(position.x, position.y, position.z);
            cube.castShadow = m.castShadow;
            cube.receiveShadow = m.receiveShadow;
            this.scene.add(cube);

            let rigidBodyDesc = this.RAPIER.RigidBodyDesc.dynamic().setTranslation(position.x, position.y, position.z);
            let rigidBody = this.physicsWorld.createRigidBody(rigidBodyDesc);
            let colliderDesc = this.RAPIER.ColliderDesc.cuboid(size.width / 2, size.height / 2, size.depth / 2);
            const Collider = this.physicsWorld.createCollider(colliderDesc, rigidBody);

            let data = {
                name: m.name,
                model: cube,
                rigidBody: rigidBody,
                Collider: Collider,
                type: 'dynamic'
            };
            resolve(data);
        })
    }

    addGltf(m, texture) {
        return new Promise((resolve, reject) => {
            const { size, position } = m;
            this.gltfLoader.load(m.path, (gltf) => {
                let data = {
                    name: m.name,
                    model: null,
                    rigidBody: null,
                    ColliderList: {},
                    type: 'fixed',
                    InteractiveList: []
                    // gameMOD: new THREE.Group(),
                };
                gltf.scene.traverse((child) => {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child instanceof THREE.Mesh) {
                        // console.log(child);
                        let childType = child.name.split('_')[1] ? child.name.split('_')[1] : 'undf';
                        if (childType === 'g') {
                            //添加刚体
                            const vertices = new Float32Array(child.geometry.attributes.position.array);

                            let indices;
                            if (child.geometry.index) {
                                indices = new Uint32Array(child.geometry.index.array);
                            } else {
                                indices = new Uint32Array([...Array(vertices.length / 3).keys()]);
                            }

                            let groundBodyDesc = this.RAPIER.RigidBodyDesc.fixed().setTranslation(child.position.x, child.position.y, child.position.z);
                            let groundBody = this.physicsWorld.createRigidBody(groundBodyDesc);
                            let groundCollider = this.RAPIER.ColliderDesc.trimesh(vertices, indices);
                            const Collider = this.physicsWorld.createCollider(groundCollider, groundBody);

                            data.ColliderList[child.name] = { Collider, groundCollider, groundBody };
                        } else if (childType === 'green') {
                            let material = new THREE.MeshStandardMaterial({
                                alphaMap: texture,
                                color: 0x3E922A, // 初始颜色为红色
                                // transparent: true,
                                // opacity: 1,
                                // side: THREE.BackSide,
                                alphaTest: 0.5
                            });
                            child.material = material;
                        } else if (childType === 'pink') {
                            let material = new THREE.MeshStandardMaterial({
                                alphaMap: texture,
                                color: 0xFF7677, // 初始颜色为红色
                                // transparent: true,
                                // opacity: 1,
                                // side: THREE.BackSide,
                                alphaTest: 0.5
                            });
                            child.material = material;
                        } else if (childType === 'm') {
                            child.material = this.TunnelMaterial;

                            child.layers.enableAll();
                            const textDiv = document.createElement('div');
                            textDiv.className = 'label';
                            textDiv.id = child.name;
                            textDiv.textContent = 'F';
                            textDiv.style.opacity = 0;

                            const textDivObj = new CSS2DObject(textDiv);
                            textDivObj.position.set(0, 0, 0);
                            textDivObj.center.set(0, 0);
                            child.add(textDivObj);

                            data.InteractiveList.push({
                                CSS2DObject: textDiv,
                                position: child.position,
                                visible: false,
                                transformPs: {
                                    x: 70.4608383178711,
                                    y: 6,
                                    z: 110.66502380371094
                                }
                            })
                            // this.game.InteractiveList
                        }



                        // data.rigidBody = groundBody;
                        // data.Collider = Collider;

                        if (child.name === '小岛_g' || child.name === '小岛2_g') {
                            this.loadGrass(child, 4000, child.name);
                            child.castShadow = false;
                            child.receiveShadow = true;
                        }
                        if (child.name === '小岛_g') {
                            this.loadFlower(child, 200);
                        }
                    }
                })
                gltf.scene.name = 'gameModel';
                this.scene.add(gltf.scene);
                data.model = gltf.scene;
                resolve(data);
            })
        })
    }

    loadGrass(terrainMesh, grassCount, childName) {
        this.gltfLoader.load("/grass.glb", (gltf) => {
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.name.includes("grass")) {
                        child.geometry.scale(2, 1, 2)
                        child.castShadow = true;
                        child.receiveShadow = true;
                        this.grassGeometry = child.geometry;

                    }
                }
            });
            this.addGrass(terrainMesh, this.grassGeometry, grassCount);
            this.setupTextures(childName);
        })
    }


    addGrass(surfaceMesh, grassGeometry, grassCount) {
        // Create a sampler for a Mesh surface.
        const sampler = new MeshSurfaceSampler(surfaceMesh)
            .setWeightAttribute("_color")
            .build();

        // Create a material for grass
        const grassInstancedMesh = new THREE.InstancedMesh(
            grassGeometry,
            this.grassMaterial.material,
            grassCount
        );
        grassInstancedMesh.receiveShadow = true;

        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3(1, 1, 1);

        const normal = new THREE.Vector3();
        const yAxis = new THREE.Vector3(0, 1, 0);
        const matrix = new THREE.Matrix4();

        // Sample randomly from the surface, creating an instance of the sample
        // geometry at each sample point.
        for (let i = 0; i < grassCount; i++) {
            sampler.sample(position, normal);

            // Align the instance with the surface normal
            quaternion.setFromUnitVectors(yAxis, normal);
            // Create a random rotation around the y-axis
            const randomRotation = new THREE.Euler(0, Math.random() * Math.PI * 2, 0);
            const randomQuaternion = new THREE.Quaternion().setFromEuler(
                randomRotation
            );

            // Combine the alignment with the random rotation
            quaternion.multiply(randomQuaternion);
            // Set the new scale in the matrix
            matrix.compose(position, quaternion, scale);

            grassInstancedMesh.setMatrixAt(i, matrix);
        }
        this.scene.add(grassInstancedMesh);
    }

    setupTextures(childName) {
        this.textures.perlinNoise = this.textureLoader.load("/perlinnoise.webp");

        this.textures.perlinNoise.wrapS = this.textures.perlinNoise.wrapT =
            THREE.RepeatWrapping;

        this.textures.grassAlpha = this.textureLoader.load("/grass.jpg");

        this.grassMaterial.setupTextures(
            this.textures.grassAlpha,
            this.textures.perlinNoise
        );
        
        // if (childName === '小岛_g') {
        //     this.grassMaterial.setupGUI(debugGui.GuiAddFolder('草'));
        //     const GuiAddFolder = debugGui.GuiAddFolder('传送门')
        //     GuiAddFolder.addColor(this.Uniforms, "uColorStart").onChange((value) => {
        //         this.TunnelMaterial.uniforms.uColorStart.value.set(value);
        //         // console.log(value);uColorEnd
        //     });
        //     GuiAddFolder.addColor(this.Uniforms, "uColorEnd").onChange((value) => {
        //         this.TunnelMaterial.uniforms.uColorEnd.value.set(value);
        //     });
        // }
    }

    loadFlower(surfaceMesh, count) {
        this.gltfLoader.load("/flower.glb", (gltf) => {
            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.name.includes("flower")) {
                        // child.geometry.scale(2, 1, 2)
                        // child.castShadow = true;
                        // child.receiveShadow = true;
                        // this.grassGeometry = child.geometry;
                        let material = child.material;
                        // child.renderOrder = 100;
                        this.addFlower(surfaceMesh, child.geometry, count, material)
                    }
                }
            });
        })

    }

    addFlower(surfaceMesh, geometry, count, material) {
        const sampler = new MeshSurfaceSampler(surfaceMesh)
            .setWeightAttribute("_color")
            .build();

        // Create a material for grass
        const grassInstancedMesh = new THREE.InstancedMesh(
            geometry,
            material,
            count
        );
        // grassInstancedMesh.receiveShadow = true;
        grassInstancedMesh.renderOrder = 10;
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3(1, 1, 1);

        const normal = new THREE.Vector3();
        const yAxis = new THREE.Vector3(0, 1, 0);
        const matrix = new THREE.Matrix4();

        // Sample randomly from the surface, creating an instance of the sample
        // geometry at each sample point.
        for (let i = 0; i < count; i++) {
            sampler.sample(position, normal);

            // Align the instance with the surface normal
            quaternion.setFromUnitVectors(yAxis, normal);
            // Create a random rotation around the y-axis
            const randomRotation = new THREE.Euler(0, Math.random() * Math.PI * 2, 0);
            const randomQuaternion = new THREE.Quaternion().setFromEuler(
                randomRotation
            );

            // Combine the alignment with the random rotation
            quaternion.multiply(randomQuaternion);
            scale.y = 1 + Math.random() * 0.2;
            // Set the new scale in the matrix
            matrix.compose(position, quaternion, scale);

            grassInstancedMesh.setMatrixAt(i, matrix);
        }
        this.scene.add(grassInstancedMesh);
    }

    update(clock) {
        this.Uniforms.uTime.value += clock;
        this.grassMaterial.update(this.Uniforms.uTime.value);

        this.TunnelMaterial.uniforms.uTime.value += clock;
    }
}