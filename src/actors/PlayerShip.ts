import {Ship} from "./Ship";
import {Scene} from "@babylonjs/core/scene";
import {Camera} from "@babylonjs/core/Cameras/camera";
import {Vector3} from "@babylonjs/core/Maths/math.vector";

export class PlayerShip extends Ship {
    private cam:Camera|null = null;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.cam = new Camera("playerShipCamera", new Vector3(0, 0,0 ), scene, true);
        scene.activeCamera = this.cam;

        this.cam.position = this.location.add(new Vector3(0, 0, -5));

        console.log(`camera position ${this.cam.position}`)

        Vector3.Forward(false);
    }
}
