import {SquidThing} from "./SquidThing";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {Util} from "../util/Util";
import {Scene} from "@babylonjs/core/scene";
import {Vector3} from "@babylonjs/core/Maths/math.vector";

export class SquidBoss extends SquidThing {
    static async preload(scene:Scene){
        const thing = (await SceneLoader.ImportMeshAsync(null, './assets/squid_thing_boss.glb', '', scene));

        SquidBoss.shipModel = thing.meshes[0];
        Util.setVisibility(SquidBoss.shipModel, false);
    }

    constructor(pos:Vector3) {
        super(pos);

        this.hp = 30;
    }

    protected getModelTemplate(){
        return SquidBoss.shipModel!;
    }

    getAttackCooldown(): number {
        return 0.25;
    }
}
