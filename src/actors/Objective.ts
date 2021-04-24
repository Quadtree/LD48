import {Actor} from "../am/Actor";
import {PlayerShip} from "./PlayerShip";
import {Scene} from "@babylonjs/core/scene";

export class Objective extends Actor {
    update(delta: number) {
        super.update(delta);

        const playerShips = this.actorManager!.actors.filter(it => it instanceof PlayerShip);

        let zone = 0;
        this.actorManager!.scene!.fogMode = Scene.FOGMODE_NONE;
        this.actorManager!.scene!.fogColor.set(0.2, 0.2, 0.2);

        if (playerShips.length > 0) {
            const playerShip = playerShips[0] as PlayerShip;

            const dist = playerShip.model!.position.length();

            if (dist > 1900) {
                // pass
            } else if (dist > 1300){
                this.actorManager!.scene!.fogMode = Scene.FOGMODE_LINEAR;
                this.actorManager!.scene!.fogColor.set(0.2, 0.2, 0.2);
                zone = 1;
            } else if (dist > 700){
                this.actorManager!.scene!.fogMode = Scene.FOGMODE_LINEAR;
                this.actorManager!.scene!.fogColor.set(0.3, 0.3, 0.0);
                zone = 2;
            } else if (dist > 300){
                this.actorManager!.scene!.fogMode = Scene.FOGMODE_LINEAR;
                this.actorManager!.scene!.fogColor.set(0.4, 0.0, 0.0);
                zone = 3;
            } else {
                this.actorManager!.scene!.fogMode = Scene.FOGMODE_LINEAR;
                this.actorManager!.scene!.fogColor.set(0.4, 0.0, 0.4);
                zone = 4;
            }
        }


    }
}
