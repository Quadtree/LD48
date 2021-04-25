import {Vector3} from "@babylonjs/core/Maths/math.vector";

export class SpawnableTypes {
    static readonly TYPE_ASTEROID = "1";
    static readonly TYPE_SQUIDTHING = "2";
    static readonly TYPE_SQUIDSLOWER = "3";
}

export interface Spawnable {
    getSpawnableType():string;

    getPos():Vector3;

    despawn():boolean;
}
