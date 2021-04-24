import {Actor} from "../am/Actor";
import {Scene} from "@babylonjs/core/scene";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {Vector3} from "@babylonjs/core/Maths/math.vector";

export class Ship extends Actor {
    static shipModel:AbstractMesh|null = null;

    static async preload(scene: Scene){
        Ship.shipModel = (await SceneLoader.ImportMeshAsync(null, './assets/ship1.glb', '', scene)).meshes[0];
        Ship.shipModel.visibility = 0;
    }

    private model:AbstractMesh|null = null;

    location:Vector3 = new Vector3();

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.model = Ship.shipModel!.clone("", null);
        this.model!.position.copyFrom(this.location);

        console.log(`ship placed at ${this.model?.position}`)
    }
}
