import {Color4} from "@babylonjs/core";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";

export interface Trackable {
    isActivelyTrackable():boolean;
    getColor():Color4;
    getText():string;
    keep():boolean;
    getMesh():AbstractMesh;
}
