import { Game } from "./util/Game";
import { GameManager } from "./util/GameManager";
import {ActorManager} from "./am/ActorManager";
import {PlayerShip} from "./actors/PlayerShip";
import {Ship} from "./actors/Ship";
import {Camera} from "@babylonjs/core/Cameras/camera";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {DirectionalLight} from "@babylonjs/core/Lights/directionalLight";
import {Starfield} from "./actors/Starfield";
import {Asteroid} from "./actors/Asteroid";

export class LD48 implements Game {
    private actorManager = new ActorManager()

    public static gm:GameManager|null = null;

    async init(gameManager:GameManager):Promise<void> {
        console.log("init()");

        new Camera("loadingCamera", new Vector3(0, 0,0 ), gameManager.scene, true);

        await gameManager.enablePhysics();

        LD48.gm = gameManager;

        this.actorManager.scene = gameManager.scene;

        await Promise.all([
            Ship.preload(gameManager.scene),
            Starfield.preload(gameManager.scene),
            Asteroid.preload(gameManager.scene),
        ]);

        const playerShip = new PlayerShip();

        this.actorManager.add(playerShip);
        this.actorManager.add(new Starfield());
        this.actorManager.add(new Asteroid(new Vector3(0,0,-15)));

        new DirectionalLight("", new Vector3(-1, -1, 0), gameManager.scene);
    }

    update(delta:number):void {
        //console.log(`update(${delta})`);

        this.actorManager.update(delta);
    }
}
