import {Actor} from "../am/Actor";
import {Trackable} from "./Trackable";
import {Color4} from "@babylonjs/core";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {Scene} from "@babylonjs/core/scene";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {Util} from "../util/Util";
import {Vector3} from "@babylonjs/core/Maths/math.vector";

export class Beacon extends Actor implements Trackable {
    public mesh:AbstractMesh|null = null;

    constructor(private startLoc:Vector3, private text:string = "Last Known Position", private visible:boolean = false) {
        super();
    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = MeshBuilder.CreateBox("", {});
        Util.setVisibility(this.mesh, this.visible);
        this.mesh!.position.copyFrom(this.startLoc);
    }

    getText(): string {
        return this.text;
    }

    getMesh(): AbstractMesh {
        return this.mesh!;
    }

    isActivelyTrackable(): boolean {
        return true;
    }

    getColor(): Color4 {
        return new Color4(0.25, 0.25, 1, 1);
    }
}
