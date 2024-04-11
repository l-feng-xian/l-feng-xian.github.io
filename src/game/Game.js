import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import EmitBus from '../untils/emitBus';
import Camera from './Camera';
import Resize from './Resize';
import Controls from './controls/Controls';
import Load from './loadResources/Load';
import Sky from './sky/Sky';
import Physics from './physics/Physics';
import RunRender from './RunRender';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
// import { EffectComposer, RenderPass } from 'postprocessing';
// import { GodraysPass } from 'three-good-godrays';

export default class Game {
    static instance;
    constructor(Canvas) {
        if (Game.instance) {
            return Game.instance;
        }
        Game.instance = this;
        this.canvas = Canvas;
        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.gameSchedule = 2020;
        this.Interactive = false;
        this.InteractiveList = [];
        this.clockDelta = null;
        this.character = null;
        this.characterAction = { animations: [], mixer: null };
        this.characterPhysics = {};
        this.LoadingCompleted = false;
        this.scene = new THREE.Scene();
        this.camera = new Camera();
        this.resize = new Resize();
        this.sky = new Sky()

        this.Physics = new Physics()
        //物理世界加载完成
        EmitBus.once("addPhysicsed", () => {
            this.controls = new Controls();
            this.load = new Load();
            console.log('onLoad');
        })

        this.setRenderer();
    }

    setRenderer() {
         //开始加载
        // this.loadingManager.onStart = ((url, loed, total) => {
        //     console.log(url, loed, total);
        // })
        //已知文件-加载进度
        this.loadingManager.onProgress = ((url, loed, total) => {
            console.log(url, loed, total);
            EmitBus.emit("LoadingProgress", loed)
        })
        //加载完成
        // this.loadingManager.onLoad = (() => {
        //     console.log('onLoad');
        //     // this.game.LoadingCompleted = true;
        //     // EmitBus.emit('characterLoaded')

        // })
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            precision: "highp", // Use high precision
            // powerPreference: "high-performance",
            // stencil: false,
            // depth: false
        })

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.autoUpdate = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.setClearColor('#ffffff', 1);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.labelRenderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(this.labelRenderer.domElement);

        //添加上帝折射后处理
        // this.composer = new EffectComposer(this.renderer, { frameBufferType: THREE.HalfFloatType });
        // const renderPass = new RenderPass(this.scene, this.camera.camera);
        // renderPass.renderToScreen = false;
        // this.composer.addPass(renderPass);
        // const params = {
        //     density: 0.005,
        //     maxDensity: 0.1,
        //     edgeStrength: 0,
        //     edgeRadius: 2,
        //     distanceAttenuation: 0,
        //     color: new THREE.Color(0xffffff),
        //     raymarchSteps: 60,
        //     blur: true,
        //     gammaCorrection: true,
        // };

        // const godraysPass = new GodraysPass(this.sky.directionalLight, this.camera.camera, params);
        // godraysPass.renderToScreen = true;
        // this.composer.addPass(godraysPass);

        this.runRender = new RunRender()
    }
}