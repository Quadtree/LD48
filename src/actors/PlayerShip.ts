import {Ship} from "./Ship";
import {Scene} from "@babylonjs/core/scene";
import {Camera} from "@babylonjs/core/Cameras/camera";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {UniversalCamera} from "@babylonjs/core/index";

export class PlayerShip extends Ship {
    private cam:Camera|null = null;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.cam = new UniversalCamera("playerShipCamera", new Vector3(0, 0,0 ), scene, true);
        scene.activeCamera = this.cam;

        this.cam!.position.copyFrom(this.location.add(new Vector3(0, 0, -20)));

        console.log(`camera position ${this.cam!.position}`)

        Vector3.Forward(false);
    }
}
