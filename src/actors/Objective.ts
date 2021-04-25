import {Actor} from "../am/Actor";
import {PlayerShip} from "./PlayerShip";
import {Scene} from "@babylonjs/core/scene";
import {Asteroid} from "./Asteroid";
import {Util} from "../util/Util";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {installations} from "firebase";
import {SquidThing} from "./SquidThing";
import {Spawnable, SpawnableTypes} from "./Spawnable";
import {HUD} from "./HUD";
import {SquidSlower} from "./SquidSlower";

export class Objective extends Actor {
    private spawnCharge:{[key:string]:number} = {};

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

            const targetOfType:{[key:string]:number} = {};

            if (zone == 0){
                targetOfType[SpawnableTypes.TYPE_SQUIDSLOWER] = 1;
            }

            if (zone == 1){
                targetOfType[SpawnableTypes.TYPE_ASTEROID] = 25;
                targetOfType[SpawnableTypes.TYPE_SQUIDTHING] = 2;
            }

            for (const type in targetOfType) {
                const allAsteroids = this.actorManager!.actors.filter(it => {
                    return (it as any).getSpawnableType && (it as any).getSpawnableType() == type;
                }).map(it => it as unknown as Spawnable);

                let despawnRange = 60;
                if (type == SpawnableTypes.TYPE_SQUIDTHING || type == SpawnableTypes.TYPE_SQUIDSLOWER) despawnRange = 350;

                let astCount = 0;

                for (const ast of allAsteroids) {
                    if (ast.getPos().subtract(playerShip.model!.position).length() > despawnRange) {
                        if (!ast.despawn()) astCount++;
                    } else {
                        astCount++;
                    }
                }

                if (astCount < targetOfType[type] && type != SpawnableTypes.TYPE_ASTEROID) {
                    if (typeof this.spawnCharge[type] === "undefined") this.spawnCharge[type] = 1;
                    this.spawnCharge[type] += (targetOfType[type] - astCount) * delta * .07;
                }

                this.spawnCharge[SpawnableTypes.TYPE_ASTEROID] = 1000;

                //HUD.debugData!.text = JSON.stringify(this.spawnCharge);

                while (astCount < targetOfType[type] && (this.spawnCharge[type] >= 1)) {
                    playerShip.model!.rotationQuaternion!.toRotationMatrix(Util.mat);

                    let spawnRange = 20;
                    if (type == SpawnableTypes.TYPE_SQUIDTHING || type == SpawnableTypes.TYPE_SQUIDSLOWER) spawnRange = 140;

                    const pos = Util.randomPointOnSphere(playerShip.model!.position.add(Vector3.TransformCoordinates(new Vector3(0, 0, 30), Util.mat)), spawnRange);

                    if (type == SpawnableTypes.TYPE_ASTEROID) this.actorManager!.add(new Asteroid(pos));
                    if (type == SpawnableTypes.TYPE_SQUIDTHING) this.actorManager!.add(new SquidThing(pos));
                    if (type == SpawnableTypes.TYPE_SQUIDSLOWER) this.actorManager!.add(new SquidSlower(pos));

                    astCount++;

                    this.spawnCharge[type] -= 1;
                }
            }


        }


    }
}
