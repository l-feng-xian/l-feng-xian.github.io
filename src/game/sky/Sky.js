import * as THREE from 'three'
import Game from '../Game';
import SkyBackground from './SkyBackground';
import Stars from './Stars';
import SkySphere from './SkySphere';
import Clock from './Clock';
import { Water } from 'three/addons/objects/Water.js';
import EmitBus from '../../untils/emitBus';

export default class Sky {
    constructor() {
        this.game = new Game();
        this.scene = this.game.scene;
        this.camera = this.game.camera.camera;
        this.textureLoader = this.game.textureLoader;
        this.clock = new Clock();

        this.outerDistance = 1000;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.dirx = new THREE.Vector3();
        this.skyPosition = new THREE.Vector3();

        this.time = { value: 0.1 }

        this.addLight();
        this.addSkyBG();
        // this.addFog();
        // this.setSun();
        // this.setCustomRender();
        // this.setBackground();
        // this.setStars();
        // this.setSphere();

        EmitBus.on("dayTimeC", (type) => {
            this.dayTimeChange(type)
        })
    }

    addLight() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.castShadow = true;
        this.directionalLight.position.set(-100, 400, -600);
        this.directionalLight.shadow.camera.far = 1000;
        this.directionalLight.shadow.camera.left = -50;
        this.directionalLight.shadow.camera.right = 50;
        this.directionalLight.shadow.camera.top = 50;
        this.directionalLight.shadow.camera.bottom = -50;
        this.directionalLight.shadow.mapSize.set(4096, 4096);
        this.directionalLight.shadow.bias = -0.0001;
        // this.directionalLight.shadow.radius = 5;
        this.scene.add(this.directionalLight);
    }

    addFog() {
        this.scene.fog = new THREE.FogExp2("#74bcdb", 0.001);
    }

    setCustomRender() {
        this.customRender = {};
        this.customRender.scene = new THREE.Scene();
        this.customRender.camera = this.camera.clone();
        this.customRender.resolutionRatio = 0.1;
        this.customRender.renderTarget = new THREE.WebGLRenderTarget(
            this.game.resize.width * this.customRender.resolutionRatio,
            this.game.resize.height * this.customRender.resolutionRatio,
            {
                generateMipmaps: false
            }
        )
        this.customRender.texture = this.customRender.renderTarget.texture;
    }

    setBackground() {
        this.background = {};
        this.background.geometry = new THREE.PlaneGeometry(2, 2);
        // this.background.material = new THREE.MeshBasicMaterial({ wireframe: false, map: this.customRender.renderTarget.texture })
        this.background.material = SkyBackground();
        this.background.material.uniforms.uTexture.value = this.customRender.renderTarget.texture;
        // this.background.material.wireframe = true
        this.background.material.depthTest = false;
        this.background.material.depthWrite = false;

        this.background.mesh = new THREE.Mesh(this.background.geometry, this.background.material);
        this.background.mesh.frustumCulled = false;

        this.group.add(this.background.mesh);
    }

    setStars() {
        this.stars = {}
        this.stars.count = 1000
        this.stars.distance = this.outerDistance

        this.stars.update = () => {
            // Create geometry
            const positionArray = new Float32Array(this.stars.count * 3)
            const sizeArray = new Float32Array(this.stars.count)
            const colorArray = new Float32Array(this.stars.count * 3)

            for (let i = 0; i < this.stars.count; i++) {
                const iStride3 = i * 3

                // Position
                const position = new THREE.Vector3()
                position.setFromSphericalCoords(this.stars.distance, Math.acos(Math.random()), 2 * Math.PI * Math.random())

                positionArray[iStride3] = position.x
                positionArray[iStride3 + 1] = position.y
                positionArray[iStride3 + 2] = position.z

                // Size
                sizeArray[i] = Math.pow(Math.random() * 0.9, 10) + 0.1

                // Color
                const color = new THREE.Color()
                color.setHSL(Math.random(), 1, 0.5 + Math.random() * 0.5)
                colorArray[iStride3] = color.r
                colorArray[iStride3 + 1] = color.g
                colorArray[iStride3 + 2] = color.b
            }

            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3))
            geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizeArray, 1))
            geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colorArray, 3))

            // Dispose of old one
            if (this.stars.geometry) {
                this.stars.geometry.dispose()
                this.stars.points.geometry = this.stars.geometry
            }

            this.stars.geometry = geometry
        }

        // Geometry
        this.stars.update()

        // Material
        // this.stars.material = new THREE.PointsMaterial({ size: 5, sizeAttenuation: false })
        this.stars.material = Stars()
        this.stars.material.uniforms.uHeightFragments.value = this.game.resize.height * this.game.resize.clampedPixelRatio

        // Points
        this.stars.points = new THREE.Points(this.stars.geometry, this.stars.material)
        this.group.add(this.stars.points)
    }

    setSun() {
        this.sun = {};
        this.sun.distance = this.outerDistance - 50;

        const geometry = new THREE.CircleGeometry(0.03 * this.sun.distance, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.sun.mesh = new THREE.Mesh(geometry, material);
        this.sun.mesh.position.set(-100, 400, -600)
        this.group.add(this.sun.mesh);
    }

    setSphere() {
        this.sphere = {}
        this.sphere.widthSegments = 128
        this.sphere.heightSegments = 64
        this.sphere.update = () => {
            const geometry = new THREE.SphereGeometry(10, this.sphere.widthSegments, this.sphere.heightSegments)
            if (this.sphere.geometry) {
                this.sphere.geometry.dispose()
                this.sphere.mesh.geometry = this.sphere.geometry
            }

            this.sphere.geometry = geometry
        }
        this.sphere.material = SkySphere()

        this.sphere.material.uniforms.uColorDayCycleLow.value.set('#f0fff9')
        this.sphere.material.uniforms.uColorDayCycleHigh.value.set('#2e89ff')
        this.sphere.material.uniforms.uColorNightLow.value.set('#004794')
        this.sphere.material.uniforms.uColorNightHigh.value.set('#001624')
        this.sphere.material.uniforms.uColorSun.value.set('#e3c4c4')
        this.sphere.material.uniforms.uColorDawn.value.set('#dfa3a3')
        this.sphere.material.uniforms.uDayCycleProgress.value = 0
        this.sphere.material.side = THREE.BackSide

        this.sphere.update()

        // this.sphere.material.wireframe = true
        this.sphere.mesh = new THREE.Mesh(this.sphere.geometry, this.sphere.material)
        this.customRender.scene.add(this.sphere.mesh)
    }

    addSkyBG() {
        //添加天空盒
        this.datTimeTexture = this.textureLoader.load("/sky.webp");
        this.nightTexture = this.textureLoader.load("/night.webp");
        this.datTimeTexture.colorSpace = THREE.SRGBColorSpace;
        this.nightTexture.colorSpace = THREE.SRGBColorSpace;
        const skybox = new THREE.SphereGeometry(1000, 50, 50);
        this.skyMaterial = new THREE.MeshBasicMaterial({ map: this.datTimeTexture, side: THREE.BackSide });
        this.skyboxMesh = new THREE.Mesh(skybox, this.skyMaterial);
        this.group.add(this.skyboxMesh);

        //添加水面
        const waterGeometry = new THREE.PlaneGeometry(2010, 2010);
        this.water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: this.textureLoader.load('/WaterNormal.jpg', function (texture) {

                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

                }),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: this.scene.fog !== undefined
            }
        );

        this.water.rotation.x = - Math.PI / 2;
        this.water.material.uniforms['size'].value = 0.4;
        this.scene.add(this.water);
    }

    dayTimeChange(type) {
        if (type) {
            this.skyMaterial.map = this.datTimeTexture;
            this.skyMaterial.needsUpdate = true;
            
            this.ambientLight.intensity = 1;
            this.directionalLight.color = new THREE.Color("#ffffff");
        } else {
            this.skyMaterial.map = this.nightTexture;
            this.skyMaterial.needsUpdate = true;

            this.ambientLight.intensity = 0.9;
            this.directionalLight.color = new THREE.Color("#e5f1f9");
            
        }
    }

    update() {

        this.clock.update();
        // if( 0.3 >= this.clock.progress >= 0.7) {
        //     console.log(1);
        // } else {
        // }
        // Group
        this.group.position.copy(this.skyPosition);
        // Sphere
        // this.sphere.material.uniforms.uSunPosition.value.set(this.clock.position.x, this.clock.position.y, this.clock.position.z)
        // this.sphere.material.uniforms.uDayCycleProgress.value = this.clock.progress
        // Sun
        // this.sun.mesh.position.set(
        //     this.clock.position.x * this.sun.distance,
        //     this.clock.position.y * this.sun.distance,
        //     this.clock.position.z * this.sun.distance
        // )
        // this.sun.mesh.lookAt(this.skyPosition);
        // directionalLight
        // this.directionalLight.position.set(
        //     this.clock.position.x * this.sun.distance,
        //     this.clock.position.y * this.sun.distance,
        //     this.clock.position.z * this.sun.distance
        // );
        this.water.material.uniforms['time'].value += 1.0 / 60.0;
        this.water.material.uniforms['sunDirection'].value.copy(this.directionalLight.position).normalize();
        // console.log(this.sun.mesh);

        // // Stars
        // this.stars.material.uniforms.uSunPosition.value.set(this.clock.position.x, this.clock.position.y, this.clock.position.z)
        // this.stars.material.uniforms.uHeightFragments.value = this.game.resize.height * this.game.resize.clampedPixelRatio
        // // // console.log(this.customRender.camera);
        // this.customRender.camera.quaternion.copy(this.camera.quaternion)
        // this.game.renderer.setRenderTarget(this.customRender.renderTarget)
        // this.game.renderer.render(this.customRender.scene, this.customRender.camera)
        // this.game.renderer.setRenderTarget(null)
    }
}