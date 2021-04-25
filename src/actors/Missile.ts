import {EnergyBolt} from "./EnergyBolt";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {Scene} from "@babylonjs/core/scene";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {Util} from "../util/Util";

export class Missile extends EnergyBolt {
    static shipModel:AbstractMesh|null = null;

    mesh:AbstractMesh|null = null;

    static async preload(scene:Scene){
        const thing = (await SceneLoader.ImportMeshAsync(null, './assets/missile.glb', '', scene));

        Missile.shipModel = thing.meshes[0];
        Util.setVisibility(Missile.shipModel, false);
    }

    createMesh() {
        this.mesh = Missile.shipModel!.clone("", null);
        Util.setVisibility(this.mesh!, true);
    }

    getDamageOnHit(){
        return 5;
    }
}
