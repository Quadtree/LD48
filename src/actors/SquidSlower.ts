import {Actor} from "../am/Actor";
import {SquidThing} from "./SquidThing";
import {PlayerShip} from "./PlayerShip";
import {SpawnableTypes} from "./Spawnable";
import {Color3, Material, Mesh, StandardMaterial} from "@babylonjs/core/index";
import {Asteroid} from "./Asteroid";
import {Scene} from "@babylonjs/core";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {Util} from "../util/Util";

export class SquidSlower extends SquidThing {
    static eyeMat:Material|null = null;

    private eyeBeam:Mesh|null = null;

    public isUsingEyeBeam = false;

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

        this.eyeBeam = MeshBuilder.CreateBox("", {width: 0.5, height: 0.5, depth: 1});
        this.eyeBeam.material = SquidSlower.eyeMat;
        Util.setVisibility(this.eyeBeam, false);
    }

    protected fireWeapon(playerShip:PlayerShip){
        const rangeToTarget = playerShip.model!.position.subtract(this.model!.position).length();

        if (rangeToTarget < 120){
            Util.setVisibility(this.eyeBeam!, true);

            this.eyeBeam!.position = playerShip.model!.position.add(this.model!.position).scaleInPlace(0.5);
            this.eyeBeam!.scaling.z = rangeToTarget;
            this.eyeBeam!.lookAt(playerShip.model!.position);

            this.isUsingEyeBeam = true;
        }
    }

    update(delta: number) {
        Util.setVisibility(this.eyeBeam!, false);
        this.isUsingEyeBeam = false;

        super.update(delta);
    }

    exitingView() {
        super.exitingView();

        this.eyeBeam!.dispose();
    }

    getSpawnableType(): string {
        return SpawnableTypes.TYPE_SQUIDSLOWER;
    }

    protected getBaseSpeed(){
        return 20;
    }

    protected getTurboSpeed(){
        return 35;
    }
}
