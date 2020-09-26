import { Camera } from "@babylonjs/core/Cameras/camera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Scene } from "@babylonjs/core/scene";
import { Sprite } from "@babylonjs/core/Sprites/sprite";
import { SpriteManager } from "@babylonjs/core/Sprites/spriteManager";
import { Vector2 } from "@babylonjs/core/Maths/math.vector";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { LibGDXSpriteManager } from '../LibGDXSpriteManager';
import * as matter from 'matter-js'
import { ActorManager } from '../am/ActorManager';
import { Actor } from '../am/Actor';
import { replicated } from '../net/annotations/Replicated';

export class BoxActor extends Actor {
    sprite?:Sprite

    @replicated
    pos:Vector2 = new Vector2(0, 0)

    public enteringView(){
        this.sprite = new Sprite('s1', BaseGame.s.spriteManager as any)
        this.sprite.cellRef = 'box1'
    }

    public update(){
        if (this.sprite){
            this.sprite.position.x = this.pos.x
            this.sprite.position.y = this.pos.y
        }
    }
}

export class BaseGame {
    protected _canvas?: HTMLCanvasElement;
    protected _engine?: Engine;
    protected _scene: Scene;
    protected _camera: FreeCamera;
    public spriteManager?:SpriteManager
    public actorManager?:ActorManager

    public createWorld:boolean = false

    public static s:BaseGame

    constructor(canvasElement : string) {
        BaseGame.s = this

        // Create canvas and engine.
        this.createEngine(canvasElement)

        if (!this._engine) throw new Error('Unable to find engine')

        // Create a basic BJS Scene object.
        this._scene = new Scene(this._engine);

        this.actorManager = new ActorManager()

        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        this._camera = new FreeCamera('camera1', new Vector3(0, 5,-10), this._scene);
        this._camera.mode = Camera.ORTHOGRAPHIC_CAMERA
        this._camera.orthoBottom = -5
        this._camera.orthoTop = 5
        this._camera.orthoLeft = -5 * this._engine.getAspectRatio(this._camera)
        this._camera.orthoRight = 5 * this._engine.getAspectRatio(this._camera)


        // Target the camera to scene origin.
        this._camera.setTarget(Vector3.Zero());

        this.attachCamera()

        LibGDXSpriteManager.createFromAtlas('sm', 5000, this._scene, 'assets/pack.atlas').then((sm:SpriteManager) => {
            this.spriteManager = sm

            if (this.createWorld){
                //for (let i=0;i<4;++i){
                //    this.actorManager?.add(new BoxActor())
                //}

                console.log('world created')
            }
        })
    }

    protected createEngine(canvasElement : string){

    }

    protected attachCamera(){

    }

    doRender() : void {
        console.log('doRender() called')
        // Run the render loop.

        if (!this._engine) throw new Error('BLOWN ENGINE')

        this._engine.runRenderLoop(() => {
            if (!this.actorManager) throw new Error('no actor manager')

            this.actorManager.update(0.016)

            this._scene.render();
        });
    }
}
