import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import { EventState } from "@babylonjs/core/Misc/observable";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { KeyboardEventTypes, KeyboardInfo } from "@babylonjs/core/Events/keyboardEvents";
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { Scene } from "@babylonjs/core/scene";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Actor } from "../am/Actor";
import { btHolder, Util } from "../util/Util";

declare var Ammo: any;

const CF_CHARACTER_OBJECT = 16;

const DefaultFilter = 1;
const StaticFilter = 2;
const CharacterFilter = 32;

interface btVector3 {
    length(): number;
    x(): number;
    y(): number;
    z(): number;
    setX(x: number): void;
    setY(y: number): void;
    setZ(z: number): void;
    setValue(x: number, y: number, z: number): void;
    normalize(): void;
    rotate(wAxis: btVector3, angle: number): btVector3;
    dot(v: btVector3): number;
    op_mul(x: number): btVector3;
    op_add(v: btVector3): btVector3;
    op_sub(v: btVector3): btVector3;
};

let debugUi: AdvancedDynamicTexture
let debugUiText: TextBlock

export class Character extends Actor {
    private readonly camera: FreeCamera;

    private moveForward = false;
    private moveBackward = false;
    private moveLeft = false;
    private moveRight = false;
    private jump = false;

    private isAdded = true;
    private addCharge = 1;

    private acceptingInput = true;

    private readonly ghostObjectHolder: btHolder<any>;
    private readonly transformHolder:btHolder<any>;
    private readonly capsuleShapeHolder:btHolder<any>;
    private static ghostPairCallbackHolder:btHolder<any>;
    private readonly characterControllerHolder:btHolder<any>;

    private get character(){ return this.characterControllerHolder.v; }

    public get pos() {
        let v3 = this.character.getGhostObject().getWorldTransform().getOrigin();

        return this.toBJVector3(v3);
    }

    public set pos(v: Vector3) {
        this.character.getGhostObject().getWorldTransform().setOrigin(this.toBLVector3(v).v);
    }

    public constructor(protected scene: Scene, private canvas: HTMLCanvasElement | null, position: Vector3) {
        super()

        this.camera = new FreeCamera('', new Vector3(), this.scene);
        this.camera.minZ = 0.1;
        this.camera.maxZ = 800;
        this.camera.inertia = 0;
        this.camera.angularSensibility = 400;
        console.log(`fov=${this.camera.fov}`);
        if (this.canvas) {
            this.camera.attachControl(this.canvas, false);
        }

        this.camera.keysDown = [];
        this.camera.keysLeft = [];
        this.camera.keysUp = [];
        this.camera.keysRight = [];

        let ajsp = this.scene.getPhysicsEngine()!.getPhysicsPlugin() as AmmoJSPlugin

        this.transformHolder = new btHolder<any>(new Ammo.btTransform());

        let startTransform = this.transformHolder.v;
        startTransform.setIdentity();
        startTransform.setOrigin(this.toBLVector3(position).v);


        this.ghostObjectHolder = new btHolder<any>(new Ammo.btPairCachingGhostObject());
        let m_ghostObject = this.ghostObjectHolder.v;

        m_ghostObject.setWorldTransform(startTransform);

        if (Character.ghostPairCallbackHolder == null){
            Character.ghostPairCallbackHolder = new btHolder<any>(new Ammo.btGhostPairCallback());
            ajsp.world.getBroadphase().getOverlappingPairCache().setInternalGhostPairCallback(Character.ghostPairCallbackHolder.v);
        }

        const characterHeight = 1.75;
        const characterWidth = 1.00;
        this.capsuleShapeHolder = new btHolder<any>(new Ammo.btCapsuleShape(characterWidth, characterHeight));
        let capsule = this.capsuleShapeHolder.v;
        m_ghostObject.setCollisionShape(capsule);
        m_ghostObject.setCollisionFlags(CF_CHARACTER_OBJECT);

        const stepHeight = 0.35;
        this.characterControllerHolder = new btHolder<any>(new Ammo.btKinematicCharacterController(m_ghostObject, capsule, stepHeight));
        let m_character = this.characterControllerHolder.v;

        console.log(`cc=${m_character}`)

        ajsp.world.addCollisionObject(m_ghostObject, CharacterFilter, StaticFilter | DefaultFilter);
        ajsp.world.addAction(m_character);

        if (this.canvas) {
            this.scene.onKeyboardObservable.add((ed: KeyboardInfo, es: EventState) => {
                if (this.acceptingInput) {
                    if (ed.type == KeyboardEventTypes.KEYDOWN || ed.type == KeyboardEventTypes.KEYUP) {
                        const evt = ed.event as KeyboardEvent;
                        const down = ed.type == KeyboardEventTypes.KEYDOWN;
                        if (evt.key == 'w' || evt.key == 'ArrowUp') this.moveForward = down;
                        if (evt.key == 's' || evt.key == 'ArrowDown') this.moveBackward = down;
                        if (evt.key == 'a' || evt.key == 'ArrowLeft') this.moveLeft = down;
                        if (evt.key == 'd' || evt.key == 'ArrowRight') this.moveRight = down;
                        if (evt.key == ' ') this.jump = down;
                    }
                }
            });

            //debugUi = AdvancedDynamicTexture.CreateFullscreenUI('', true, this.scene);
            debugUiText = new TextBlock('', 'test')
            //debugUi.addControl(debugUiText)
            debugUiText.left = -600
            debugUiText.top = -600
            debugUiText.color = '#ffffff'

            this.scene.onPointerObservable.add((ed: PointerInfo, es: EventState) => {
                if (this.acceptingInput) {
                    if (ed.type == PointerEventTypes.POINTERTAP && ed.event instanceof PointerEvent) {
                        this.canvas!.requestPointerLock();
                    }
                    if (ed.type == PointerEventTypes.POINTERDOWN) {
                        if (!this.canvas!.hasPointerCapture((ed.event as PointerEvent).pointerId)) {
                            this.pointerDown();
                        }
                    }
                    if (ed.type == PointerEventTypes.POINTERUP) {
                        this.pointerUp();
                    }
                }
            });
        }
    }

    protected pointerDown() {

    }

    protected pointerUp() {

    }

    protected getCameraOffset(): Vector3 {
        return new Vector3(0, 0, 0);
    }

    public update(delta: number) {
        let v3: btVector3 = this.character.getGhostObject().getWorldTransform().getOrigin();

        this.camera.position = this.toBJVector3(v3).add(new Vector3(0, 0.75, 0)).add(this.getCameraOffset());

        const walkSpeed = 0.25;

        let angle = this.camera.rotation.y;

        let forwardVector = new Vector3(Math.sin(angle), 0, -Math.cos(angle));
        let rightVector = new Vector3(Math.sin(angle + (Math.PI / 2)), 0, -Math.cos(angle + (Math.PI / 2)));

        let walkDirection = new Vector3(0, 0, 0);

        if (this.moveForward) walkDirection.addInPlace(forwardVector.scale(walkSpeed));
        if (this.moveBackward) walkDirection.addInPlace(forwardVector.scale(-walkSpeed));
        if (this.moveRight) walkDirection.addInPlace(rightVector.scale(walkSpeed));
        if (this.moveLeft) walkDirection.addInPlace(rightVector.scale(-walkSpeed));

        let blWalkDirection: btHolder<btVector3> = this.toBLVector3(walkDirection);

        this.character.setWalkDirection(blWalkDirection.v);

        if (this.jump) {
            const v3 = this.toBLVector3(new Vector3(0, 20, 0));
            this.character.jump(v3.v);
            this.jump = false;
        }

        const shouldBeAdded = blWalkDirection.v.length() > 0.01 || !this.character.onGround();

        if (!shouldBeAdded) {
            this.addCharge -= delta * 5;
        } else {
            this.addCharge = 1;
        }

        if (this.addCharge <= 0 && this.isAdded) {
            this.scene.getPhysicsEngine()!.getPhysicsPlugin().world.removeAction(this.character);
            this.isAdded = false;
        }

        if (this.addCharge >= 1 && !this.isAdded) {
            this.scene.getPhysicsEngine()!.getPhysicsPlugin().world.addAction(this.character);
            this.isAdded = true;
        }

        if (this.canvas)
            debugUiText.text = `angle=${this.camera.rotation.y}\npos=${this.formatBJVector(this.toBJVector3(v3))}\nwalkDirection=${this.formatVector(blWalkDirection.v, 4)}\nonGround=${this.character.onGround()}\nisAdded=${this.isAdded} addCharge=${this.addCharge.toFixed(1)} shouldBeAdded=${shouldBeAdded}\n${this.getExtraText()}`
    }

    protected getExtraText(): string {
        return "";
    }


    exitingWorld() {
        super.exitingWorld();

        if (this.isAdded) {
            this.scene.getPhysicsEngine()!.getPhysicsPlugin().world.removeAction(this.character);
            this.isAdded = false;
        }

        const ajsp = this.scene.getPhysicsEngine()!.getPhysicsPlugin() as AmmoJSPlugin
        ajsp.world.removeCollisionObject(this.ghostObjectHolder.v);
    }

    private formatVector(v3: btVector3, fixedPlaces: number = 1) {
        return `${v3.x().toFixed(fixedPlaces)},${v3.y().toFixed(fixedPlaces)},${v3.z().toFixed(fixedPlaces)}`;
    }

    private formatBJVector(v3: Vector3, fixedPlaces: number = 1) {
        return `${v3.x.toFixed(fixedPlaces)},${v3.y.toFixed(fixedPlaces)},${v3.z.toFixed(fixedPlaces)}`;
    }

    private toBLVector3(v3: Vector3): btHolder<btVector3> {
        return Util.toBLVector3(v3);
    }

    private toBJVector3(v3: btVector3): Vector3 {
        return new Vector3(
            v3.x(),
            v3.y(),
            v3.z()
        );
    }
}
