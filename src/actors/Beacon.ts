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

    constructor(private startLoc:Vector3) {
        super();
    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = MeshBuilder.CreatePlane("", {});
        Util.setVisibility(this.mesh, false);
        this.mesh!.position.copyFrom(this.startLoc);
    }

    getText(): string {
        return "Last Known Position";
    }

    getMesh(): AbstractMesh {
        return this.mesh!;
    }

    isActivelyTrackable(): boolean {
        return true;
    }

    getColor(): Color4 {
        return new Color4(0,0,1,1);
    }
}
