import {Ship} from "./Ship";
import {Scene} from "@babylonjs/core/scene";
import {Camera} from "@babylonjs/core/Cameras/camera";
import {Matrix, Quaternion, Vector3} from "@babylonjs/core/Maths/math.vector";
import {LD48} from "../LD48";
import {TargetCamera} from "@babylonjs/core/Cameras/targetCamera";
import {KeyboardEventTypes} from "@babylonjs/core/Events/keyboardEvents";
import {PointerEventTypes} from "@babylonjs/core/Events/pointerEvents";
import {Color3, Color4, ParticleSystem, Plane, Ray, Sound} from "@babylonjs/core";
import {EnergyBolt} from "./EnergyBolt";
import {Util} from "../util/Util";
import {Damagable} from "./Damagable";
import {installations} from "firebase";
import {HUD} from "./HUD";
import {SquidThing} from "./SquidThing";
import {Missile} from "./Missile";
import {Explosion} from "./Explosion";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {Texture} from "@babylonjs/core/Materials/Textures/texture";

class EngineTrail {
    system:ParticleSystem;

    constructor(private scene:Scene, private playerShip:PlayerShip, private offset:Vector3) {
        console.log("TRAIL!");

        this.system = new ParticleSystem("", 200, scene);

        //if (!Explosion.texture) Explosion.texture =

        this.system.createSphereEmitter(0.05, 0);

        this.system.particleTexture = new Texture("assets/solid.png", scene);
        this.system.minLifeTime = 0.1
        this.system.maxLifeTime = 0.2
        this.system.minSize = 0.4
        this.system.maxSize = 0.5
        this.system.color1 = new Color4(1,.8,0,1);
        this.system.color2 = new Color4(1,.8,0,1);
        this.system.colorDead = new Color4(1,.8,0,0);
        //this.system.manualEmitCount = 20
        this.system.emitRate = 0


        this.system.direction1 = new Vector3(.2,.2,.2).scale(0.0)
        this.system.direction2 = this.system.direction1.scale(-1)

        this.system.addVelocityGradient(0, 1)
        this.system.addVelocityGradient(0.1, 1)
        this.system.addVelocityGradient(0.2, .1)
        this.system.addVelocityGradient(1, 0)

        this.system.blendMode = ParticleSystem.BLENDMODE_STANDARD

        this.system.start()

        this.update(0);
    }

    update(delta:number){
        this.playerShip.model!.rotationQuaternion!.toRotationMatrix(Util.mat);

        this.system.emitter = this.playerShip.model!.position.add(Vector3.TransformCoordinates(this.offset, Util.mat));

        this.system.emitRate = (this.playerShip.forwardKeyDown || this.playerShip.leftKeyDown || this.playerShip.rightKeyDown) ? 40 : 0;
    }

    dispose(){
        this.system.dispose();
    }
}

export class PlayerShip extends Ship implements Damagable {
    private cam:TargetCamera|null = null;

    private static readonly turnSpeed = 2;

    forwardKeyDown = false;
    leftKeyDown = false;
    rightKeyDown = false;

    private firing = false;

    private cannonCharge = 0;

    private yesSeriously:Quaternion = new Quaternion();

    commandedThrustFactor = 0

    getMaxHP(){
        return 20 - 2 * LD48.s!.difficulty
    }

    hp:number = 20;
    missiles = 4;

    radiationDamage = false;

    actualThrust = new Vector3();

    engineFlames:EngineTrail[] = [];

    static takeDamageSound:Sound|null = null;
    static destroyedSound:Sound|null = null;

    static async preload(scene:Scene){
        PlayerShip.takeDamageSound = await Util.loadSound("assets/playerdamaged.wav", scene);
        PlayerShip.destroyedSound = await Util.loadSound("assets/playerdestroyed.wav", scene);
    }

    constructor(private startPos:Vector3) {
        super();
    }

    targetingSphere:AbstractMesh|null = null;

    keyboardCallback:any;
    mouseCallback:any;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.cam = new TargetCamera("playerShipCamera", new Vector3(0, 0,0 ), scene);

        if (scene.activeCamera) scene.activeCamera.dispose();

        scene.activeCamera = this.cam as Camera;

        console.log(`camera position ${this.cam!.position}`)

        this.keyboardCallback = (ed:any, es:any) => {
            //console.log(ed.event.key);

            if (ed.type == KeyboardEventTypes.KEYDOWN && (ed.event.key == "w" || ed.event.key == "ArrowUp")) { this.forwardKeyDown = true; }
            if (ed.type == KeyboardEventTypes.KEYUP && (ed.event.key == "w" || ed.event.key == "ArrowUp")) this.forwardKeyDown = false;

            if (ed.type == KeyboardEventTypes.KEYDOWN && (ed.event.key == "a" || ed.event.key == "ArrowLeft")) this.leftKeyDown = true;
            if (ed.type == KeyboardEventTypes.KEYUP && (ed.event.key == "a" || ed.event.key == "ArrowLeft")) this.leftKeyDown = false;

            if (ed.type == KeyboardEventTypes.KEYDOWN && (ed.event.key == "d" || ed.event.key == "ArrowRight")) this.rightKeyDown = true;
            if (ed.type == KeyboardEventTypes.KEYUP && (ed.event.key == "d" || ed.event.key == "ArrowRight")) this.rightKeyDown = false;

            const cheatToPos = (pos:number) => {
                for (const actor of this.actorManager!.actors){
                    if (actor instanceof PlayerShip){
                        actor.model!.position.z = pos;
                    }
                }
            }

            if (ed.type == KeyboardEventTypes.KEYUP && ed.event.key == "r") LD48.s!.restart();

            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "1" && Util.CHEATS_ENABLED) cheatToPos(-1700);
            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "2" && Util.CHEATS_ENABLED) cheatToPos(-800);
            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "3" && Util.CHEATS_ENABLED) cheatToPos(-400);
            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "4" && Util.CHEATS_ENABLED) cheatToPos(-100);

            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "i" && Util.CHEATS_ENABLED) this.hp = 9999999;
            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "p" && Util.CHEATS_ENABLED){
                for (const a of this.actorManager!.actors){
                    if (a instanceof SquidThing){
                        a.hp = -10000;
                    }
                }
            }
        };

        this.mouseCallback = (pi:any, es:any) => {
            if (pi.type == PointerEventTypes.POINTERDOWN && pi.event.buttons == 1) this.firing = true;
            if (pi.type == PointerEventTypes.POINTERUP && pi.event.buttons == 0) this.firing = false;

            if (pi.type == PointerEventTypes.POINTERDOWN && pi.event.buttons == 2) this.fireMissile();
        };

        this.actorManager!.scene!.onKeyboardObservable.add(this.keyboardCallback);
        this.actorManager!.scene!.onPointerObservable.add(this.mouseCallback);

        this.model!.position = this.startPos;
        this.positionCamera(0, 0, 0);

        this.targetingSphere = MeshBuilder.CreateIcoSphere("", {radius: 100});

        this.engineFlames.push(new EngineTrail(scene, this, new Vector3(-0.5,-0.1,-2)));
        this.engineFlames.push(new EngineTrail(scene, this, new Vector3(.5,-0.1,-2)));
    }

    private fireCannons(delta: number){
        if (this.cannonCharge >= 0.75){
            this.cannonCharge = 0;

            const holder = this.actorManager?.scene?.pick(this.actorManager?.scene?.pointerX!, this.actorManager?.scene?.pointerY!);
            if (holder?.pickedPoint) {

                const mat = new Matrix();
                this.model!.rotationQuaternion!.toRotationMatrix(mat);

                const cannonLocs = [
                    this.model!.position!.add(Vector3.TransformCoordinates(new Vector3(-5, -1, 0), mat)),
                    this.model!.position!.add(Vector3.TransformCoordinates(new Vector3(5, -1, 0), mat)),
                ];

                for (const cannonLoc of cannonLocs) {
                    const angle = Util.rotationBetweenVectors(Vector3.Forward(false), holder?.pickedPoint!.subtract(cannonLoc));

                    angle.toRotationMatrix(mat);

                    const pos = cannonLoc.add(Vector3.TransformCoordinates(new Vector3(0, 0, 5), mat));

                    this.actorManager!.add(new EnergyBolt(pos, angle, 0, 180));
                }
            }
        }
    }

    private fireMissile(){
        if (this.missiles > 0) {
            this.model!.rotationQuaternion!.toRotationMatrix(Util.mat);

            this.actorManager!.add(new Missile(this.model!.position.add(Vector3.TransformCoordinates(new Vector3(0, 0, 5), Util.mat)), this.model!.rotationQuaternion!.clone(), 0, 180));

            this.missiles -= 1;
        }
    }

    positionCamera(yaw:number, pitch:number, delta:number):Matrix{
        const qt = this.model!.rotationQuaternion!;
        const mat = new Matrix();
        qt?.toRotationMatrix(mat);

        const transformed = Vector3.TransformCoordinates(new Vector3(0 + (yaw * 4 * (delta == 0 ? 0 : 1)), 3 + (-pitch * (delta == 0 ? 0 : 1)), -20), mat);
        const camTargetPos = this.model!.position!.add(transformed);

        this.cam!.position.copyFrom(camTargetPos)//this.oldCamPoses[this.oldCamPoses.length - 1][1].add(this.model!.position));
        this.cam!.rotationQuaternion = this.model!.rotationQuaternion! //this.oldCamPoses[this.oldCamPoses.length - 1][2].clone()

        return mat;
    }

    update(delta: number) {
        super.update(delta);

        this.targetingSphere!.position = this.model!.position;

        const yaw = ((this.actorManager!.scene!.pointerX / LD48.gm!.canvas!.width) - 0.5) * 2;
        const pitch = ((this.actorManager!.scene!.pointerY / LD48.gm!.canvas!.height) - 0.5) * 2;

        if (LD48.s?.mouseIn && delta > 0){
            this.model!.rotationQuaternion!.copyFrom(this.yesSeriously);
            this.model?.addRotation(pitch * delta * PlayerShip.turnSpeed, yaw * delta * PlayerShip.turnSpeed, 0);
            this.yesSeriously = this.model!.rotationQuaternion!.clone();
        }

        //console.log(yaw * delta * PlayerShip.turnSpeed);

        //console.log(mat);

        const mat = this.positionCamera(yaw, pitch, delta);

        const thrust = new Vector3();
        if (this.forwardKeyDown) thrust.addInPlace(Vector3.Forward(false).scale(40));
        if (this.leftKeyDown) thrust.addInPlace(Vector3.Left().scale(15));
        if (this.rightKeyDown) thrust.addInPlace(Vector3.Right().scale(15));

        thrust.scaleInPlace(1 / (1 + this.actorManager!.actors.filter(it => (it as any).isUsingEyeBeam).length * 1.4));

        //HUD.debugData!.text = `${thrust.length()}`;

        if (delta > 0) {
            const desiredThrust = Vector3.TransformCoordinates(thrust, mat);

            const maxChangeRate = delta * 80;

            const desiredToActualDelta = desiredThrust.subtract(this.actualThrust);
            if (desiredToActualDelta.length() <= maxChangeRate) {
                this.actualThrust.copyFrom(desiredThrust);
            } else {
                this.actualThrust.addInPlace(desiredToActualDelta.normalize().scale(maxChangeRate));
            }

            this.model!.physicsImpostor!.setLinearVelocity(this.actualThrust);
        } else {
            this.model!.physicsImpostor!.setLinearVelocity(new Vector3(0,0,0));
        }

        this.model!.physicsImpostor!.setAngularVelocity(new Vector3(0,0,0));

        //this.model!.physicsImpostor!.setDeltaRotation(Quaternion.RotationYawPitchRoll(-pitch * PlayerShip.turnSpeed, yaw * PlayerShip.turnSpeed, 0));

        /*const zeroRotation = this.model!.rotationQuaternion!.clone();
        zeroRotation.multiplyInPlace(Quaternion.FromEulerAngles(0, 0, 0));
        zeroRotation.normalize();

        const targetRotation = Quaternion.RotationYawPitchRoll(-pitch * PlayerShip.turnSpeed, yaw * PlayerShip.turnSpeed, 0);

        targetRotation.multiplyInPlace(Quaternion.FromEulerAngles(-pitch * PlayerShip.turnSpeed, yaw * PlayerShip.turnSpeed, 0));
        targetRotation.normalize();

        const rot = targetRotation.toEulerAngles().subtract(zeroRotation.toEulerAngles());
        //console.log(`${targetRotation.toEulerAngles()} - ${zeroRotation.toEulerAngles()} = ${rot}`);

        this.model!.physicsImpostor!.setAngularVelocity(rot);*/
        this.model!.physicsImpostor!.wakeUp();

        //console.log(`${yaw} ${pitch}`);

        this.cannonCharge += delta;

        if (this.firing){
            this.fireCannons(delta);
        }

        if (this.hp > this.getMaxHP()) this.hp = this.getMaxHP();

        for (const engineTrail of this.engineFlames) engineTrail.update(delta);
    }

    killedByDamage = false

    takeDamage(amt: number) {
        const prevRound = Math.round(this.hp);

        this.hp -= amt;

        if (Math.round(this.hp) < prevRound){
            PlayerShip.takeDamageSound!.play();
        }

        //console.log(`player ship took ${amt} damage ${this.hp} left`)

        if (!this.keep()) this.killedByDamage = true
    }

    getFaction(): number {
        return 0;
    }

    getPos(): Vector3 {
        return this.model!.position.clone();
    }

    keep(): boolean {
        return super.keep() && this.hp >= 1;
    }

    exitingView() {
        super.exitingView();

        this.model!.dispose();

        if (this.killedByDamage){
            PlayerShip.destroyedSound!.play();
            this.actorManager!.add(new Explosion(this.model!.position.clone(), 10, new Color3(1, .71, 0)))
        }

        this.targetingSphere!.dispose();

        for (const a of this.engineFlames) a.dispose();
        this.engineFlames = [];

        this.actorManager!.scene!.onKeyboardObservable.removeCallback(this.keyboardCallback);
        this.actorManager!.scene!.onPointerObservable.removeCallback(this.mouseCallback);
    }
}
