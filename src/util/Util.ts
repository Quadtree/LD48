import { Scene, Sound } from "@babylonjs/core";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import {Matrix, Quaternion, Vector3} from "@babylonjs/core/Maths/math.vector";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";

declare const Ammo: any;
declare const FinalizationRegistry:any;

interface btVector3 {
    length(): number;
    x(): number;
    y(): number;
    z(): number;
    setX(x: number): void;
    setY(y: number): void;
    setZ(z: number): void;
    setValue(x: number, y: number, z: number): void;
    normalize(): void;
    rotate(wAxis: btVector3, angle: number): btVector3;
    dot(v: btVector3): number;
    op_mul(x: number): btVector3;
    op_add(v: btVector3): btVector3;
    op_sub(v: btVector3): btVector3;
};

export class btHolder<T> {
    private static bulletFinalizationRegistry = new FinalizationRegistry((itm:any) => {
        Ammo.destroy(itm);
    });

    constructor(public readonly v:T){
        btHolder.bulletFinalizationRegistry.register(this, v);
    }
}

export class Util {
    static deepEquals(val1: any, val2: any): boolean {
        if (typeof (val1) != typeof (val2)) return false;

        if (val1 === val2) return true;
        if ((val1 === null) != (val2 === null)) return false;

        if (typeof (val1) == "object") {
            let keys: any = {};
            for (let k in val1) keys[k] = true;
            for (let k in val2) keys[k] = true;

            for (let k in keys) {
                if (!Util.deepEquals(val1[k], val2[k])) return false;
            }
            return true;
        }

        return false;
    }

    static deepJsonCopy(val: any): any {
        return JSON.parse(JSON.stringify(val));
    }

    private static formatVector(v3: btVector3, fixedPlaces: number = 1) {
        return `${v3.x().toFixed(fixedPlaces)},${v3.y().toFixed(fixedPlaces)},${v3.z().toFixed(fixedPlaces)}`;
    }

    public static toBLVector3(v3: Vector3): btHolder<btVector3> {
        const ret = new btHolder<btVector3>(new Ammo.btVector3());
        ret.v.setX(v3.x);
        ret.v.setY(v3.y);
        ret.v.setZ(-v3.z);

        return ret;
    }

    public static toBJVector3(v3: btVector3): Vector3 {
        return new Vector3(
            v3.x(),
            v3.y(),
            v3.z()
        );
    }

    static rayTest(scene: Scene, from: Vector3, to: Vector3): boolean {
        let ajsp = scene.getPhysicsEngine()!.getPhysicsPlugin() as AmmoJSPlugin

        const world = ajsp.world;

        const cb = new btHolder<any>(new Ammo.ClosestRayResultCallback());
        const fromBTV = Util.toBLVector3(from);
        const toBTV = Util.toBLVector3(to);

        world.rayTest(fromBTV.v, toBTV.v, cb.v);

        return cb.v.m_collisionObject.ptr != 0;
    }

    static loadSound(url: string, scene: Scene, loop: boolean = false): Promise<Sound> {
        return new Promise<Sound>((resolve, reject) => {
            const sound = new Sound("", url, scene, () => {
                resolve(sound);
            }, { loop: loop, autoplay: false });
        });
    }

    static async delay(ms: number): Promise<void> {
        return new Promise<void>((res, rej) => {
            setTimeout(res, ms);
        });
    }

    static setVisibility(mesh:AbstractMesh, visible:boolean){
        mesh.isVisible = visible;

        for (const sm of mesh.getChildTransformNodes()){
            if (sm instanceof AbstractMesh){
                sm.isVisible = visible;
            }
        }
    }

    static rotationBetweenVectors(v1:Vector3, v2:Vector3, maxTurn:number = 10000):Quaternion {
        const uv1 = v1.normalizeToNew();
        const uv2 = v2.normalizeToNew();

        let angle = Math.acos(Vector3.Dot(uv1, uv2));

        /*if (Math.abs(angle) > maxTurn){
            if (angle >= 0){
                angle = Math.min(angle, maxTurn);
            } else {
                angle = Math.max(angle, -maxTurn);
            }
        }*/

        const axis = Vector3.Cross(uv1, uv2);
        return Quaternion.RotationAxis(axis, angle);
    }

    static mat = new Matrix();

    static CHEATS_ENABLED = false;
}
