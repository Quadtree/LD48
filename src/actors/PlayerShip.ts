import {Ship} from "./Ship";
import {Scene} from "@babylonjs/core/scene";
import {Camera} from "@babylonjs/core/Cameras/camera";
import {Matrix, Quaternion, Vector3} from "@babylonjs/core/Maths/math.vector";
import {LD48} from "../LD48";
import {TargetCamera} from "@babylonjs/core/Cameras/targetCamera";
import {KeyboardEventTypes} from "@babylonjs/core/Events/keyboardEvents";
import {PointerEventTypes} from "@babylonjs/core/Events/pointerEvents";
import { Plane, Ray } from "@babylonjs/core";
import {EnergyBolt} from "./EnergyBolt";
import {Util} from "../util/Util";
import {Damagable} from "./Damagable";

export class PlayerShip extends Ship implements Damagable {
    private cam:TargetCamera|null = null;

    private static readonly turnSpeed = 2;

    private forwardKeyDown = false;
    private leftKeyDown = false;
    private rightKeyDown = false;

    private firing = false;

    private cannonCharge = 0;

    private yesSeriously:Quaternion = new Quaternion();

    private hp:number = 15;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.cam = new TargetCamera("playerShipCamera", new Vector3(0, 0,0 ), scene);
        scene.activeCamera = this.cam as Camera;

        console.log(`camera position ${this.cam!.position}`)

        this.actorManager!.scene!.onKeyboardObservable.add((ed, es) => {
            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "w") { this.forwardKeyDown = true; console.log("W"); }
            if (ed.type == KeyboardEventTypes.KEYUP && ed.event.key == "w") this.forwardKeyDown = false;

            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "a") this.leftKeyDown = true;
            if (ed.type == KeyboardEventTypes.KEYUP && ed.event.key == "a") this.leftKeyDown = false;

            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "d") this.rightKeyDown = true;
            if (ed.type == KeyboardEventTypes.KEYUP && ed.event.key == "d") this.rightKeyDown = false;
        });

        this.actorManager!.scene!.onPointerObservable.add((pi, es) => {
            if (pi.type == PointerEventTypes.POINTERDOWN) this.firing = true;
            if (pi.type == PointerEventTypes.POINTERUP) this.firing = false;
        });
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

                    this.actorManager!.add(new EnergyBolt(pos, angle));
                }
            }
        }
    }

    update(delta: number) {
        super.update(delta);

        const yaw = ((this.actorManager!.scene!.pointerX / LD48.gm!.canvas!.width) - 0.5) * 2;
        const pitch = ((this.actorManager!.scene!.pointerY / LD48.gm!.canvas!.height) - 0.5) * 2;

        if (LD48.s?.mouseIn){
            this.model!.rotationQuaternion!.copyFrom(this.yesSeriously);
            this.model?.addRotation(pitch * delta * PlayerShip.turnSpeed, yaw * delta * PlayerShip.turnSpeed, 0);
            this.yesSeriously = this.model!.rotationQuaternion!.clone();
        }

        //console.log(yaw * delta * PlayerShip.turnSpeed);

        const qt = this.model!.rotationQuaternion!;
        const mat = new Matrix();
        qt?.toRotationMatrix(mat);

        //console.log(mat);

        const transformed = Vector3.TransformCoordinates(new Vector3(0, 3, -20), mat);
        const camTargetPos = this.model!.position!.add(transformed);

        //this.cam!.position = this.cam!.position.scale(0.8).addInPlace(this.model!.position!.add(transformed).scale(0.2));

        const camMoveRate = 20 * delta;

        const camDelta = camTargetPos.subtract(this.cam!.position);
        if (camDelta.length() < camMoveRate){
            this.cam!.position.copyFrom(camTargetPos);
        } else {
            this.cam!.position = this.cam!.position.add(camDelta.normalize().scale(camMoveRate));
        }

        this.cam!.rotationQuaternion = this.model!.rotationQuaternion!;

        const thrust = new Vector3();
        if (this.forwardKeyDown) thrust.addInPlace(Vector3.Forward(false));
        if (this.leftKeyDown) thrust.addInPlace(Vector3.Left());
        if (this.rightKeyDown) thrust.addInPlace(Vector3.Right());

        //console.log(`TH ${thrust}`);


        if (thrust.length() > 0.1){
            thrust.normalize();
            thrust.scaleInPlace(40);
        } else {
            thrust.set(0,0,0);
        }

        this.model!.physicsImpostor!.setLinearVelocity(Vector3.TransformCoordinates(thrust, mat));
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
    }

    takeDamage(amt: number) {
        this.hp -= amt;
        console.log(`player ship took ${amt} damage ${this.hp} left`)
    }

    getFaction(): number {
        return 0;
    }

    getPos(): Vector3 {
        return this.model!.position.clone();
    }

    keep(): boolean {
        return super.keep() && this.hp > 0;
    }

    exitingWorld() {
        super.exitingWorld();

        this.model!.dispose();
        this.cam!.dispose();
    }
}
