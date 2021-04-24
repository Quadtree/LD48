import {Ship} from "./Ship";
import {Scene} from "@babylonjs/core/scene";
import {Camera} from "@babylonjs/core/Cameras/camera";
import {Matrix, Quaternion, Vector3} from "@babylonjs/core/Maths/math.vector";
import {LD48} from "../LD48";
import {TargetCamera} from "@babylonjs/core/Cameras/targetCamera";

export class PlayerShip extends Ship {
    private cam:TargetCamera|null = null;

    private static readonly turnSpeed = 2;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.cam = new TargetCamera("playerShipCamera", new Vector3(0, 0,0 ), scene);
        scene.activeCamera = this.cam as Camera;

        console.log(`camera position ${this.cam!.position}`)

        Vector3.Forward(false);
    }

    update(delta: number) {
        super.update(delta);

        const yaw = ((this.actorManager!.scene!.pointerX / LD48.gm!.canvas!.width) - 0.5) * 2;
        const pitch = ((this.actorManager!.scene!.pointerY / LD48.gm!.canvas!.height) - 0.5) * 2;

        this.model?.addRotation(pitch * delta * PlayerShip.turnSpeed, yaw * delta * PlayerShip.turnSpeed, 0);

        const qt = this.model!.rotationQuaternion!;
        const mat = new Matrix();
        qt?.toRotationMatrix(mat);

        //console.log(mat);

        const transformed = Vector3.TransformCoordinates(new Vector3(0, 3, -20), mat);

        this.cam!.position.copyFrom(this.model!.position!.add(transformed));
        this.cam!.rotationQuaternion = this.model!.rotationQuaternion!;

        //console.log(`${yaw} ${pitch}`);
    }
}
