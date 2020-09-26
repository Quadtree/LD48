import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import { EventState } from "@babylonjs/core/Misc/observable";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { KeyboardInfo } from "@babylonjs/core/Events/keyboardEvents";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { Scene } from "@babylonjs/core/scene";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Actor } from "./am/Actor";
import { Keys } from "./Keys";

declare var Ammo:any;

const CF_CHARACTER_OBJECT = 16;

const DefaultFilter = 1;
const StaticFilter = 2;
const CharacterFilter = 32;

interface btVector3 {
    length():number;
    x():number;
    y():number;
    z():number;
    setX(x:number):void;
    setY(y:number):void;
    setZ(z:number):void;
    setValue(x:number, y:number, z:number):void;
    normalize():void;
    rotate(wAxis:btVector3, angle:number):btVector3;
    dot(v:btVector3):number;
    op_mul(x:number):btVector3;
    op_add(v:btVector3):btVector3;
    op_sub(v:btVector3):btVector3;
};

let debugUi:AdvancedDynamicTexture
let debugUiText:TextBlock

export class Character extends Actor
{
    private character:any;

    private camera:FreeCamera;

    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    private jump = false;

    private isAdded = true;
    private addCharge = 1;

    public constructor(private scene:Scene, private canvas:HTMLCanvasElement|null){
        super()

        this.camera = new FreeCamera('', new Vector3(), this.scene);
        if (this.canvas){
            this.camera.attachControl(this.canvas, false);
        }

        let ajsp = this.scene.getPhysicsEngine()!.getPhysicsPlugin() as AmmoJSPlugin

        let startTransform = new Ammo.btTransform();
        startTransform.setIdentity();
        //startTransform.setOrigin (btVector3(0.0, 4.0, 0.0));
        startTransform.setOrigin(new Ammo.btVector3(-8,10,24));

        let m_ghostObject = new Ammo.btPairCachingGhostObject();
        m_ghostObject.setWorldTransform(startTransform);
        ajsp.world.getBroadphase().getOverlappingPairCache().setInternalGhostPairCallback(new Ammo.btGhostPairCallback());
        const characterHeight=1.75;
        const characterWidth =1.75;
        let capsule = new Ammo.btCapsuleShape(characterWidth,characterHeight);
        m_ghostObject.setCollisionShape(capsule);
        m_ghostObject.setCollisionFlags(CF_CHARACTER_OBJECT);

        const stepHeight = 0.35;
        let m_character = new Ammo.btKinematicCharacterController(m_ghostObject, capsule, stepHeight);

        this.character = m_character;

        console.log(`cc=${m_character}`)

        ajsp.world.addCollisionObject(m_ghostObject, CharacterFilter, StaticFilter|DefaultFilter);
        ajsp.world.addAction(m_character);

        this.scene.onKeyboardObservable.add((ed:KeyboardInfo, es:EventState) => {
            if (ed.type == KeyboardEventTypes.KEYDOWN || ed.type == KeyboardEventTypes.KEYUP){
                const evt = ed.event as KeyboardEvent;
                const down = ed.type == KeyboardEventTypes.KEYDOWN;
                if (evt.keyCode == Keys.W) this.moveForward = down;
                if (evt.keyCode == Keys.S) this.moveBackward = down;
                if (evt.keyCode == Keys.A) this.moveLeft = down;
                if (evt.keyCode == Keys.D) this.moveRight = down;
                if (evt.keyCode == Keys.Space) this.jump = down;
            }
        });

        debugUi = AdvancedDynamicTexture.CreateFullscreenUI('', true, this.scene);
        debugUiText = new TextBlock('', 'test')
        debugUi.addControl(debugUiText)
        debugUiText.left = -600
        debugUiText.top = -600
        debugUiText.color = '#ffffff'

        if (this.canvas){
            this.scene.onPointerObservable.add((ed:PointerInfo, es:EventState) => {
                if (ed.type == PointerEventTypes.POINTERTAP){
                    this.canvas!.requestPointerLock();
                }
            });
        }
    }

    public update(delta:number){
        let v3 = this.character.getGhostObject().getWorldTransform().getOrigin();

        this.camera.position = this.toBJVector3(v3);

        const walkSpeed = 0.25;

        let angle = this.camera.rotation.y;

        let forwardVector = new Vector3(Math.sin(angle), 0, Math.cos(angle));
        let rightVector = new Vector3(Math.sin(angle + (Math.PI / 2)), 0, Math.cos(angle + (Math.PI / 2)));

        let walkDirection = new Vector3(0,0,0);

        if (this.moveForward) walkDirection.addInPlace(forwardVector.scale(walkSpeed));
        if (this.moveBackward) walkDirection.addInPlace(forwardVector.scale(-walkSpeed));
        if (this.moveRight) walkDirection.addInPlace(rightVector.scale(walkSpeed));
        if (this.moveLeft) walkDirection.addInPlace(rightVector.scale(-walkSpeed));

        let blWalkDirection:btVector3 = this.toBLVector3(walkDirection);

        this.character.setWalkDirection(blWalkDirection);

        if (this.jump){
            this.character.jump(this.toBLVector3(new Vector3(0, 20, 0)));
            this.jump = false;
        }

        const shouldBeAdded = blWalkDirection.length() > 0.01 || !this.character.onGround();

        if (!shouldBeAdded){
            this.addCharge -= delta * 5;
        } else {
            this.addCharge = 1;
        }

        if (this.addCharge <= 0 && this.isAdded){
            this.scene.getPhysicsEngine()!.getPhysicsPlugin().world.removeAction(this.character);
            this.isAdded = false;
        }

        if (this.addCharge >= 1 && !this.isAdded){
            this.scene.getPhysicsEngine()!.getPhysicsPlugin().world.addAction(this.character);
            this.isAdded = true;
        }

        debugUiText.text = `pos=${this.formatVector(v3)}\nwalkDirection=${this.formatVector(blWalkDirection, 4)}\nonGround=${this.character.onGround()}\nisAdded=${this.isAdded} addCharge=${this.addCharge.toFixed(1)} shouldBeAdded=${shouldBeAdded}`
    }

    private formatVector(v3:btVector3, fixedPlaces:number = 1){
        return `${v3.x().toFixed(fixedPlaces)},${v3.y().toFixed(fixedPlaces)},${v3.z().toFixed(fixedPlaces)}`;
    }

    private toBLVector3(v3:Vector3):btVector3
    {
        const ret = new Ammo.btVector3();
        ret.setX(v3.x);
        ret.setY(v3.y);
        ret.setZ(v3.z);
        return ret;
    }

    private toBJVector3(v3:btVector3):Vector3
    {
        return new Vector3(
            v3.x(),
            v3.y(),
            v3.z()
        );
    }
}