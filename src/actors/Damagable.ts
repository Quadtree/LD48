import {Vector3} from "@babylonjs/core/Maths/math.vector";

export interface Damagable {
    takeDamage(amt:number):void;
    getFaction():number;
    getPos():Vector3;
}
