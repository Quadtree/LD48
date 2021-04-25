import {Actor} from "../am/Actor";
import {SquidThing} from "./SquidThing";
import {PlayerShip} from "./PlayerShip";
import {SpawnableTypes} from "./Spawnable";
import {Color3, Material, Mesh, StandardMaterial} from "@babylonjs/core/index";
import {Asteroid} from "./Asteroid";
import {Scene} from "@babylonjs/core";

export class SquidSlower extends SquidThing {
    static eyeMat:Material|null = null;

    enteringWorld() {
        super.enteringWorld();


    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        if (SquidSlower.eyeMat == null){
            const mat = new StandardMaterial("", scene);
            mat.emissiveColor = new Color3(1, 0.65, 0.65);
            SquidSlower.eyeMat = mat;
        }

        for (const nd of this.model!.getChildTransformNodes()) {
            if (nd.name == ".Cylinder.Cylinder_primitive1"){
                const mesh = nd as Mesh;
                mesh.material = SquidSlower.eyeMat;
            }
        }
    }

    protected fireWeapon(playerShip:PlayerShip){

    }

    getSpawnableType(): string {
        return SpawnableTypes.TYPE_SQUIDSLOWER;
    }
}
