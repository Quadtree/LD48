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
import {DustParticles} from "./actors/DustParticles";
import {SquidThing} from "./actors/SquidThing";
import {Objective} from "./actors/Objective";
import {HUD} from "./actors/HUD";
import {Beacon} from "./actors/Beacon";
import {SquidBoss} from "./actors/SquidBoss";
import {ScienceShip} from "./actors/ScienceShip";
import {Missile} from "./actors/Missile";
import {TitleScreen} from "./actors/TitleScreen";
import {EnergyBolt} from "./actors/EnergyBolt";

export class LD48 implements Game {
    private actorManager = new ActorManager()

    public static gm:GameManager|null = null;

    public static s:LD48|null = null;

    public mouseIn = true;

    paused = true;

    difficulty = 0;

    async init(gameManager:GameManager):Promise<void> {
        console.log("init()");

        new Camera("loadingCamera", new Vector3(0, 0,0 ), gameManager.scene, true);

        await gameManager.enablePhysics();

        LD48.gm = gameManager;
        LD48.s = this;

        this.actorManager.scene = gameManager.scene;

        this.actorManager.scene!.getPhysicsEngine()!.setGravity(Vector3.Zero());

        await Promise.all([
            Ship.preload(gameManager.scene),
            PlayerShip.preload(gameManager.scene),
            Starfield.preload(gameManager.scene),
            Asteroid.preload(gameManager.scene),
            SquidThing.preload(gameManager.scene),
            SquidBoss.preload(gameManager.scene),
            ScienceShip.preload(gameManager.scene),
            Missile.preload(gameManager.scene),
            EnergyBolt.preload(gameManager.scene),
            Objective.preload(gameManager.scene),
        ]);

        this.restart();

        //this.actorManager.add(new Beacon(new Vector3(0,0,-1900), "Start", true));

        new DirectionalLight("", new Vector3(-1, -1, 0), gameManager.scene);
    }

    restart(){
        this.actorManager.destroyAllActors();

        const playerShip = new PlayerShip(new Vector3(0,0,-1950));

        this.actorManager.add(playerShip);
        this.actorManager.add(new Starfield());
        this.actorManager.add(new DustParticles());
        this.actorManager.add(new Objective());
        this.actorManager.add(new TitleScreen());
        this.actorManager.add(new ScienceShip());
        this.actorManager.add(new Beacon(new Vector3(0,-150,-400)));
    }

    update(delta:number):void {
        //console.log(`update(${delta})`);

        this.actorManager.update(delta);
    }
}
