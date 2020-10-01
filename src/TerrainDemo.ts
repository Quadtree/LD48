import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import { CannonJSPlugin } from "@babylonjs/core/Physics/Plugins/cannonJSPlugin";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Engine } from "@babylonjs/core/Engines/engine";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PBRMetallicRoughnessMaterial } from "@babylonjs/core/Materials/PBR/pbrMetallicRoughnessMaterial";
import { PhysicsEngineSceneComponent } from "@babylonjs/core/Physics/physicsEngineComponent";
import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";
import { PhysicsViewer } from "@babylonjs/core/Debug/physicsViewer";
import { Scene } from "@babylonjs/core/scene";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import "@babylonjs/core/Physics/physicsEngineComponent";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import { Keys } from './Keys';
import { ActorManager } from './am/ActorManager';
import { Character } from './Character';





// TODO:
// - Figure out why some imported meshes don't work

// new PhysicsEngineSceneComponent();

export class TerrainDemo {
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    //private _camera: FreeCamera;
    private shadowGenerator:ShadowGenerator;
    private actorManager = new ActorManager()
    private character:Character|null = null

    constructor(canvasElement : string) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new Engine(this._canvas, true);

        // Create a basic BJS Scene object.
        this._scene = new Scene(this._engine);
        this._scene.collisionsEnabled = true
        this._scene.gravity = new Vector3(0, -0.1, 0)

        this._scene.enablePhysics(new Vector3(0, -9.8, 0), new AmmoJSPlugin())

        //this._scene.enablePhysics(new Vector3(0, -9.81, 0), new CannonJSPlugin(undefined, undefined, CANNON));

        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        //this._camera = new FreeCamera('camera1', new Vector3(0, 5,-10), this._scene);



        // Target the camera to scene origin.
        //this._camera.setTarget(Vector3.Zero());

        //this._camera = new FreeCamera("cam1", new Vector3(0, 20, 0), this._scene)

        // Attach the camera to the canvas.
        //this._camera.attachControl(this._canvas, false);

        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        const skyLight = new HemisphericLight('light1', new Vector3(0,1,0), this._scene);
        skyLight.intensity = 0.1


        const directionalLight = new DirectionalLight("light2", new Vector3(1,-0.25,1), this._scene)
        directionalLight.shadowEnabled = true
        directionalLight.autoCalcShadowZBounds = true

        this.shadowGenerator = new ShadowGenerator(1024, directionalLight);
        this.shadowGenerator.useContactHardeningShadow = true
        this.shadowGenerator.usePercentageCloserFiltering = true

        // Create a built-in "sphere" shape; with 16 segments and diameter of 2.
        //this.sphere = MeshBuilder.CreateSphere('sphere',
        //                            {segments: 16, diameter: 2}, this._scene);

        // Move the sphere upward 1/2 of its height.
        //this.sphere.position.y = 15;
        //this.sphere.position.x = -5



        // Create a built-in "ground" shape.
        //let ground = MeshBuilder.CreateGround('ground',
        //                            {width: 50, height: 50, subdivisions: 2}, this._scene);
        //ground.checkCollisions = true

        //this.sphere.physicsImpostor = new PhysicsImpostor(this.sphere, PhysicsImpostor.SphereImpostor, {mass: 1}, this._scene);
        //ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, {mass: 0}, this._scene);

        /*let ground2 = MeshBuilder.CreateGroundFromHeightMap("noise", "assets/some_noise.png", {
            width: 512,
            height: 512,
            subdivisions: 256,
            maxHeight: 10,

            onReady: () => {
                console.log('reeeedddaaaaahhh')
                //ground2.physicsImpostor = new PhysicsImpostor(ground2, PhysicsImpostor.HeightmapImpostor, {mass: 0}, this._scene)
                ground2.checkCollisions = true
                ground2.isPickable = true
                ground2.receiveShadows = true
                ground2.freezeWorldMatrix()
                this.shadowGenerator.addShadowCaster(ground2)
                console.log('we dun')
            }
        }, this._scene);*/

        this.actorManager.scene = this._scene

        //this.character = new Character(this._scene, this._canvas)
        //this.actorManager.add(this.character)
        //this.character.position = new Vector3(0, 20, 3)

        let chr = new Character(this._scene, this._canvas);
        this.actorManager.add(chr);
    }

    private sphere:any;

    async init(){
        //await this.createHeightmapTerrain();
        await this.createMeshTerrain();

        // create some reference points
        this.createBox(new Vector3(0,10,-20), 1)
        this.createBox(new Vector3(0,10,20), 1)
        this.createBox(new Vector3(-20,10,0), 1)
        this.createBox(new Vector3(20,10,0), 1)

        this.createBox(new Vector3(-8,10,24), 1)

        //const camera = new UniversalCamera('', new Vector3(0,10,0), this._scene);
        //camera.attachControl(this._canvas, false);
        //this._scene.activeCamera = camera;

        //this.setupPhysicsViewer();
    }

    createBoxTerrain(){
        const someBox = MeshBuilder.CreateBox('', {width:20, depth: 60, height: 0.2});
        someBox.physicsImpostor = new PhysicsImpostor(someBox, PhysicsImpostor.BoxImpostor, {mass: 0});

        const someBox2 = MeshBuilder.CreateBox('', {width:20, depth: 60, height: 0.2});
        someBox2.rotation.x = -0.4;
        someBox2.position.z = 30;
        someBox2.physicsImpostor = new PhysicsImpostor(someBox2, PhysicsImpostor.BoxImpostor, {mass: 0});
    }

    async createMeshTerrain() {
        const ground2 = (await SceneLoader.ImportMeshAsync(null, './assets/flat2.glb', '', this._scene)).meshes[0];
        ground2.position.y -= 50;
        ground2.position.z += 20;
        console.log(`loaded ground2=${ground2.name}`)

        const grassTexture = new Texture("assets/grass1.png", this._scene);
        grassTexture.uScale = 512
        grassTexture.vScale = 512

        const grassNormalTexture = new Texture("assets/grass1_normal.png", this._scene);
        grassNormalTexture.uScale = 512
        grassNormalTexture.vScale = 512

        const groundMat1 = new PBRMetallicRoughnessMaterial("pbr1", this._scene);
        groundMat1.metallic = 0.25;
        groundMat1.roughness = 0.8;
        groundMat1.baseTexture = grassTexture;
        groundMat1.normalTexture = grassNormalTexture;

        const tmp = ground2.parent;
        //ground2.freezeWorldMatrix();
        //console.log(`BEFORE ${ground2.getAbsolutePosition()} ${ground2.absoluteRotationQuaternion}`);
        //ground2.parent = null;
        //console.log(`AFTER ${ground2.getAbsolutePosition()} ${ground2.absoluteRotationQuaternion}`);
        //ground2.rotation.y = Math.PI;
        ground2.physicsImpostor = new PhysicsImpostor(ground2, PhysicsImpostor.MeshImpostor, {mass: 0}, this._scene);

        //console.log((ground2.physicsImpostor as any)._parent);
        //console.log(ground2.physicsImpostor.isBodyInitRequired());
        //ground2.physicsImpostor.forceUpdate();
        ground2.physicsImpostor.executeNativeFunction((world:any, physicsBody:any) => {
            console.log(world);
            console.log(physicsBody);
        });

    }

    createHeightmapTerrain():Promise<string> {
        return new Promise<string>((res, rej) => {
            let ground2 = MeshBuilder.CreateGroundFromHeightMap("noise", "assets/some_noise.png", {
                width: 512,
                height: 512,
                subdivisions: 256,
                maxHeight: 10,

                onReady: () => {
                    console.log('reeeedddaaaaahhh')
                    ground2.physicsImpostor = new PhysicsImpostor(ground2, PhysicsImpostor.MeshImpostor, {mass: 0}, this._scene)

                    ground2.physicsImpostor.executeNativeFunction((world:any, physicsBody:any) => {
                        console.log(world);
                        console.log(physicsBody);
                    });

                    ground2.checkCollisions = true
                    ground2.isPickable = true
                    ground2.receiveShadows = true
                    ground2.freezeWorldMatrix()
                    this.shadowGenerator.addShadowCaster(ground2)
                    console.log('we dun')
                    res();
                }
            }, this._scene);
        });

    }

    createBox(vec3:Vector3, mass:number = 0){
        const playerMesh = MeshBuilder.CreateBox('A BOX', {width:1, height:1, depth:1})
        playerMesh.physicsImpostor = new PhysicsImpostor(playerMesh, PhysicsImpostor.BoxImpostor, {mass: mass}, this._scene);
        playerMesh.position = vec3
    }

    setupPhysicsViewer(){
        var physicsViewer = new PhysicsViewer(this._scene);

        const showImposters = (mesh:AbstractMesh) =>{
            for(let cm of mesh.getChildMeshes()){
                showImposters(cm);
            }

            if (mesh.physicsImpostor) {
                console.log(`showing imposters for ${mesh.name}`);
                physicsViewer.showImpostor(mesh.physicsImpostor, mesh as any);
                //mesh.visibility = 0;
            } else {
                console.log(`NOT showing imposters for ${mesh.name}`);
            }
        }

        this._scene.meshes.forEach(showImposters);
    }

    async doRender() {
        // Run the render loop.
        this._engine.runRenderLoop(() => {
            //this.sphere.position.y = 4 + Math.random();
            this._scene.render();

            this.actorManager.update(0.016)

            //console.log(`mesh count ${this._scene.meshes.length}`);
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine.resize();
        });

        await this.init()
    }
}
