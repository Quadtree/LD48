import { Camera } from "@babylonjs/core/Cameras/camera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { Sprite } from "@babylonjs/core/Sprites/sprite";
import { SpriteManager } from "@babylonjs/core/Sprites/spriteManager";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { LibGDXSpriteManager } from './LibGDXSpriteManager';
import * as matter from 'matter-js'

class BoxActor {
    body:matter.Body
    sprite:Sprite

    constructor(game:Game, y:number, movable:boolean){
        this.body = matter.Bodies.rectangle(0, 0, 1, 1, {position: {x: 0, y: y}})
        if (!movable) matter.Body.setStatic(this.body, true)

        matter.World.addBody(game.pEngine.world, this.body)

        this.sprite = new Sprite('s1', game.spriteManager as any)
        this.sprite.cellRef = 'box1'
    }

    public update(){
        this.sprite.position.x = this.body.position.x
        this.sprite.position.y = this.body.position.y
        this.sprite.position.z = 0

        //console.log(this.body.position)
    }
}

export class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    private _camera: FreeCamera;
    //private _light: Light;
    public pEngine:matter.Engine
    public spriteManager?:SpriteManager
    public actors:BoxActor[] = []

    constructor(canvasElement : string) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new Engine(this._canvas, true);

        // Create a basic BJS Scene object.
        this._scene = new Scene(this._engine);

        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        this._camera = new FreeCamera('camera1', new Vector3(0, 5,-10), this._scene);
        this._camera.mode = Camera.ORTHOGRAPHIC_CAMERA
        this._camera.orthoBottom = -5
        this._camera.orthoTop = 5
        this._camera.orthoLeft = -5 * this._engine.getAspectRatio(this._camera)
        this._camera.orthoRight = 5 * this._engine.getAspectRatio(this._camera)


        // Target the camera to scene origin.
        this._camera.setTarget(Vector3.Zero());

        // Attach the camera to the canvas.
        this._camera.attachControl(this._canvas, false);

        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        //this._light = new HemisphericLight('light1', new Vector3(0,1,0), this._scene);

        // Create a built-in "sphere" shape; with 16 segments and diameter of 2.
        //this.sphere = MeshBuilder.CreateSphere('sphere',
        //                            {segments: 16, diameter: 2}, this._scene);

        // Move the sphere upward 1/2 of its height.
        //this.sphere.position.y = 4;

        this.pEngine = matter.Engine.create()
        this.pEngine.world.gravity.x = 0
        this.pEngine.world.gravity.y = -1

        // Create a built-in "ground" shape.
        //let ground = MeshBuilder.CreateGround('ground',
        //                            {width: 6, height: 6, subdivisions: 2}, this._scene);

        LibGDXSpriteManager.createFromAtlas('sm', 5000, this._scene, 'assets/pack.atlas').then(sm => {
            this.spriteManager = sm
            //const someSprite = new Sprite('s1', sm)
            //someSprite.position.y = 2
            //someSprite.cellRef = 'box1'

            for (let i=0;i<4;++i){
                this.actors.push(new BoxActor(this, i * 2, i != 0))
            }

            console.log('world created')
        })
    }

    private sphere:any;

    doRender() : void {
        // Run the render loop.
        this._engine.runRenderLoop(() => {
            //this.sphere.position.y = 4 + Math.random();
            //this._camera.setTarget(this.sphere.position);

            matter.Engine.update(this.pEngine)

            this.actors.forEach(it => it.update())

            this._scene.render();
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}
