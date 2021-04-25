import {Actor} from "../am/Actor";
import {Trackable} from "./Trackable";
import {Scene} from "@babylonjs/core/scene";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {Util} from "../util/Util";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {PlayerShip} from "./PlayerShip";
import {Color4} from "@babylonjs/core";
import {HUD} from "./HUD";

export class ScienceShip extends Actor implements Trackable {
    static shipModel:AbstractMesh|null = null;

    mesh:AbstractMesh|null = null;

    static async preload(scene:Scene){
        const thing = (await SceneLoader.ImportMeshAsync(null, './assets/science_ship.glb', '', scene));

        ScienceShip.shipModel = thing.meshes[0];
        Util.setVisibility(ScienceShip.shipModel, false);
    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = ScienceShip.shipModel!.clone("", null);
        Util.setVisibility(this.mesh!, true);
    }

    getText(): string {
        const range = this.getRangeToPlayer();
        if (range < 150){
            return "Science Ship";
        } else {
            return "Unknown Signal";
        }
    }

    getColor(): Color4 {
        return new Color4(0.25, 0.25, 1, 1);
    }

    isActivelyTrackable(): boolean {
        HUD.debugData!.text = `${this.getRangeToPlayer()}`;
        return this.getRangeToPlayer() < 600;
    }

    getMesh(): AbstractMesh {
        return this.mesh!;
    }

    getRangeToPlayer(){
        const playerShips = this.actorManager!.actors.filter(it => it instanceof PlayerShip);

        if (playerShips.length > 0) {
            const playerShip = playerShips[0] as PlayerShip;

            return playerShip.model!.position.subtract(this.mesh!.position).length();
        }

        return 9999999;
    }
}
