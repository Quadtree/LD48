import { Scene, Sound } from "@babylonjs/core";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

declare var Ammo: any;

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

    public static toBLVector3(v3: Vector3): btVector3 {
        const ret = new Ammo.btVector3();
        ret.setX(v3.x);
        ret.setY(v3.y);
        ret.setZ(-v3.z);

        Util.totalVectors++;

        if (Util.totalVectors > 10000) {
            console.log(`POSSIBLE MEMORY LEAK ${Util.totalVectors}`);
        }

        return ret;
    }

    private static totalVectors = 0;

    public static toBJVector3(v3: btVector3): Vector3 {
        return new Vector3(
            v3.x(),
            v3.y(),
            -v3.z()
        );
    }

    public static destroyVector(v3: btVector3) {
        Util.totalVectors--;
        Ammo.destroy(v3);
    }

    static rayTest(scene: Scene, from: Vector3, to: Vector3): boolean {
        let ajsp = scene.getPhysicsEngine()!.getPhysicsPlugin() as AmmoJSPlugin

        const world = ajsp.world;

        let fromBTV = null;
        let toBTV = null;
        let cb = null;
        let ret = null;

        try {
            cb = new Ammo.ClosestRayResultCallback();
            fromBTV = Util.toBLVector3(from);
            toBTV = Util.toBLVector3(to);

            ret = false;

            world.rayTest(fromBTV, toBTV, cb);

            ret = cb.m_collisionObject.ptr != 0;

        } finally {
            if (cb) Ammo.destroy(cb);
            if (fromBTV) this.destroyVector(fromBTV);
            if (toBTV) this.destroyVector(toBTV);
        }

        return ret;
    }

    static loadSound(url: string, scene: Scene, loop: boolean = false): Promise<Sound> {
        return new Promise<Sound>((resolve, reject) => {
            const sound = new Sound("", url, scene, () => {
                resolve(sound);
            }, { loop: loop, autoplay: false });
        });
    }

    static CHEATS_ENABLED = false;
}
