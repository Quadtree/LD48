import {Ship} from "./Ship";
import {Scene} from "@babylonjs/core/scene";
import {Camera} from "@babylonjs/core/Cameras/camera";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {UniversalCamera} from "@babylonjs/core/index";

export class PlayerShip extends Ship {
    private cam:Camera|null = null;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.cam = new UniversalCamera("playerShipCamera", new Vector3(0, 0,0 ), scene);
        scene.activeCamera = this.cam;

        const wm = this.model?.getWorldMatrix();

        this.cam!.position.copyFrom(Vector3.TransformCoordinates(new Vector3(0, 3, -20), wm!));

        console.log(`camera position ${this.cam!.position}`)

        Vector3.Forward(false);
    }
}
