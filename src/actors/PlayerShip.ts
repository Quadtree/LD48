import {Ship} from "./Ship";
import {Scene} from "@babylonjs/core/scene";
import {Camera} from "@babylonjs/core/Cameras/camera";
import {Matrix, Quaternion, Vector3} from "@babylonjs/core/Maths/math.vector";
import {LD48} from "../LD48";
import {TargetCamera} from "@babylonjs/core/Cameras/targetCamera";
import {KeyboardEventTypes} from "@babylonjs/core/Events/keyboardEvents";

export class PlayerShip extends Ship {
    private cam:TargetCamera|null = null;

    private static readonly turnSpeed = 2;

    private forwardKeyDown = false;
    private leftKeyDown = false;
    private rightKeyDown = false;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.cam = new TargetCamera("playerShipCamera", new Vector3(0, 0,0 ), scene);
        scene.activeCamera = this.cam as Camera;

        console.log(`camera position ${this.cam!.position}`)

        this.actorManager!.scene!.onKeyboardObservable.add((ed, es) => {
            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "w") this.forwardKeyDown = true;
            if (ed.type == KeyboardEventTypes.KEYUP && ed.event.key == "w") this.forwardKeyDown = false;

            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "a") this.leftKeyDown = true;
            if (ed.type == KeyboardEventTypes.KEYUP && ed.event.key == "a") this.leftKeyDown = false;

            if (ed.type == KeyboardEventTypes.KEYDOWN && ed.event.key == "d") this.rightKeyDown = true;
            if (ed.type == KeyboardEventTypes.KEYUP && ed.event.key == "d") this.rightKeyDown = false;
        })
    }

    update(delta: number) {
        super.update(delta);

        const yaw = ((this.actorManager!.scene!.pointerX / LD48.gm!.canvas!.width) - 0.5) * 2;
        const pitch = ((this.actorManager!.scene!.pointerY / LD48.gm!.canvas!.height) - 0.5) * 2;

        this.model?.addRotation(pitch * delta * PlayerShip.turnSpeed, yaw * delta * PlayerShip.turnSpeed, 0);

        //console.log(yaw * delta * PlayerShip.turnSpeed);

        const qt = this.model!.rotationQuaternion!;
        const mat = new Matrix();
        qt?.toRotationMatrix(mat);

        //console.log(mat);

        const transformed = Vector3.TransformCoordinates(new Vector3(0, 3, -20), mat);

        this.cam!.position = this.cam!.position.scale(0.8).addInPlace(this.model!.position!.add(transformed).scale(0.2));
        this.cam!.rotationQuaternion = this.model!.rotationQuaternion!;

        const thrust = new Vector3();
        if (this.forwardKeyDown) thrust.addInPlace(Vector3.Forward(false));
        if (this.leftKeyDown) thrust.addInPlace(Vector3.Left());
        if (this.rightKeyDown) thrust.addInPlace(Vector3.Right());

        //console.log(`TH ${thrust}`);


        if (thrust.length() > 0.1){
            thrust.normalize();
            thrust.scaleInPlace(20);
        } else {
            thrust.set(0,0,0);
        }

        this.model!.physicsImpostor!.setLinearVelocity(Vector3.TransformCoordinates(thrust, mat));
        this.model!.physicsImpostor!.setAngularVelocity(new Vector3(0, 0, 0));


        //console.log(`${yaw} ${pitch}`);
    }
}
