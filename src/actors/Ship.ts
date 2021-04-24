import {Actor} from "../am/Actor";
import {Scene} from "@babylonjs/core/scene";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor";

export class Ship extends Actor {
    static shipModel:AbstractMesh|null = null;

    static async preload(scene: Scene){
        const thing = (await SceneLoader.ImportMeshAsync(null, './assets/ship1.glb', '', scene));

        for (const mesh of thing.meshes){
            mesh.isVisible = false;
        }

        Ship.shipModel = thing.meshes[0];
    }

    public model:AbstractMesh|null = null;

    location:Vector3 = new Vector3();

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.model = Ship.shipModel!.clone("", null);
        this.model!.position.copyFrom(this.location);

        for (const mesh of this.model?.getChildTransformNodes()!){
            (mesh as any).isVisible = true;
        }

        this.model!.physicsImpostor = new PhysicsImpostor(this.model!, PhysicsImpostor.BoxImpostor, {mass: 10});

        console.log(`ship placed at ${this.model?.position}`)
    }
}
