import {Actor} from "../am/Actor";
import {PlayerShip} from "./PlayerShip";
import {Scene} from "@babylonjs/core/scene";

export class Objective extends Actor {
    update(delta: number) {
        super.update(delta);

        const playerShips = this.actorManager!.actors.filter(it => it instanceof PlayerShip);

        if (playerShips.length > 0) {
            const playerShip = playerShips[0] as PlayerShip;

            const dist = playerShip.model!.position.length();

            if (dist > 1900) {
                this.actorManager!.scene!.fogMode = Scene.FOGMODE_NONE;
                this.actorManager!.scene!.fogColor.set(0.2, 0.2, 0.2);
            } else if (dist > 1300){
                this.actorManager!.scene!.fogMode = Scene.FOGMODE_LINEAR;
                this.actorManager!.scene!.fogColor.set(0.2, 0.2, 0.2);
            } else if (dist > 700){
                this.actorManager!.scene!.fogMode = Scene.FOGMODE_LINEAR;
                this.actorManager!.scene!.fogColor.set(0.3, 0.3, 0.0);
            } else if (dist > 300){
                this.actorManager!.scene!.fogMode = Scene.FOGMODE_LINEAR;
                this.actorManager!.scene!.fogColor.set(0.4, 0.0, 0.0);
            } else {
                this.actorManager!.scene!.fogMode = Scene.FOGMODE_LINEAR;
                this.actorManager!.scene!.fogColor.set(0.4, 0.0, 0.4);
            }
        }
    }
}
