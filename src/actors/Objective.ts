import {Actor} from "../am/Actor";
import {PlayerShip} from "./PlayerShip";
import {Scene} from "@babylonjs/core/scene";
import {Asteroid} from "./Asteroid";
import {Util} from "../util/Util";
import {Vector3} from "@babylonjs/core/Maths/math.vector";

const TYPE_ASTEROID = 1;
const TYPE_SQUIDTHING = 2;

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

            const targetOfType:{[key:number]:number} = {};

            if (zone == 1){
                targetOfType[TYPE_ASTEROID] = 25;
                targetOfType[TYPE_SQUIDTHING] = 1;
            }

            for (const type in targetOfType) {
                const allAsteroids = this.actorManager!.actors.filter(it => it instanceof Asteroid).map(it => it as Asteroid);

                let astCount = 0;

                for (const ast of allAsteroids) {
                    if (ast.mesh!.position.subtract(playerShip.model!.position).length() > 60) {
                        ast.alive = false;
                    } else {
                        astCount++;
                    }
                }

                while (astCount < targetAsteroids) {
                    playerShip.model!.rotationQuaternion!.toRotationMatrix(Util.mat);

                    this.actorManager!.add(new Asteroid(Util.randomPointOnSphere(playerShip.model!.position.add(Vector3.TransformCoordinates(new Vector3(0, 0, 30), Util.mat)), 20)));
                    astCount++;
                }
            }
        }


    }
}
