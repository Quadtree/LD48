import {Actor} from "../am/Actor";
import {Scene} from "@babylonjs/core/scene";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {Mesh, StandardMaterial} from "@babylonjs/core/index";
import {Texture} from "@babylonjs/core/Materials/Textures/texture";

export class Starfield extends Actor {
    protected mesh:AbstractMesh|null = null;

    static texture:Texture|null = null;

    static async preload(scene:Scene){
        this.texture = new Texture("assets/starfield1.png", scene);
    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = MeshBuilder.CreateSphere("", {diameter: 50, sideOrientation: Mesh.BACKSIDE});

        const mat = new StandardMaterial("", scene);
        mat.emissiveTexture = Starfield.texture;
        mat.diffuseColor.set(0,0,0);
        mat.specularColor.set(0,0,0);

        this.mesh.material = mat;
    }
}
