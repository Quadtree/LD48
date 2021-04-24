import { Game } from "./util/Game";
import { GameManager } from "./util/GameManager";
import {ActorManager} from "./am/ActorManager";
import {PlayerShip} from "./actors/PlayerShip";
import {Ship} from "./actors/Ship";
import {Camera} from "@babylonjs/core/Cameras/camera";
import {Vector3} from "@babylonjs/core/Maths/math.vector";

export class LD48 implements Game {
    private actorManager = new ActorManager()

    async init(gameManager:GameManager):Promise<void> {
        console.log("init()");

        new Camera("loadingCamera", new Vector3(0, 0,0 ), gameManager.scene, true);

        this.actorManager.scene = gameManager.scene;

        await Promise.all([
            Ship.preload(gameManager.scene),
        ]);

        const playerShip = new PlayerShip();

        this.actorManager.add(playerShip);
    }

    update(delta:number):void {
        //console.log(`update(${delta})`);

        this.actorManager.update(delta);
    }
}
