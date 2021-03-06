import {SquidThing} from "./SquidThing";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {Util} from "../util/Util";
import {Scene} from "@babylonjs/core/scene";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {Mesh} from "@babylonjs/core/index";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {LD48} from "../LD48";

export class SquidBoss extends SquidThing {
    static shipModel:AbstractMesh|null = null;

    static async preload(scene:Scene){
        const thing = (await SceneLoader.ImportMeshAsync(null, './assets/squid_thing_boss.glb', '', scene));

        SquidBoss.shipModel = thing.meshes[0];
        Util.setVisibility(SquidBoss.shipModel, false);
    }

    constructor(pos:Vector3) {
        super(pos);

        this.hp = Math.min(25 + 10 * LD48.s!.difficulty, 60);
    }

    protected getModelTemplate(){
        return SquidBoss.shipModel!;
    }

    getAttackCooldown(): number {
        return Math.max(0.6 - (LD48.s!.difficulty * 0.1), 0.15) * 1.1 + (LD48.s!.difficulty == 0 ? 1 : 0);
    }

    protected getBaseSpeed(){
        return 6;
    }

    protected getTurboSpeed(){
        return 25;
    }

    getExplosionSize(){
        return 40;
    }

    protected getShotOffset(){
        return 20;
    }

    despawn() {
        return false;
    }
}
