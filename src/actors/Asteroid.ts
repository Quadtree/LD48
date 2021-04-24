import {Actor} from "../am/Actor";
import {Scene} from "@babylonjs/core/scene";
import {Texture} from "@babylonjs/core/Materials/Textures/texture";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {Mesh, StandardMaterial} from "@babylonjs/core/index";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor";

export class Asteroid extends Actor {
    protected mesh:AbstractMesh|null = null;

    static texture:Texture|null = null;

    static async preload(scene:Scene){
        this.texture = new Texture("assets/asteroid1.png", scene, true, false, Texture.NEAREST_SAMPLINGMODE);
    }

    constructor(private pos:Vector3) {
        super();
    }


    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = MeshBuilder.CreateSphere("", {diameter: 4});
        this.mesh.position = this.pos;

        const mat = new StandardMaterial("", scene);
        mat.diffuseTexture = Asteroid.texture;

        this.mesh.material = mat;

        this.mesh!.physicsImpostor = new PhysicsImpostor(this.mesh!, PhysicsImpostor.SphereImpostor, {mass: 0, });

        console.log(`radius=${this.mesh!.physicsImpostor!.getRadius()}`)
    }
}
