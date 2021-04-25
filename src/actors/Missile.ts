import {EnergyBolt} from "./EnergyBolt";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {Scene} from "@babylonjs/core/scene";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {Util} from "../util/Util";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {SquidThing} from "./SquidThing";
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor";

export class Missile extends EnergyBolt {
    static shipModel:AbstractMesh|null = null;

    mesh:AbstractMesh|null = null;

    aimPoint:Vector3 = new Vector3();

    static async preload(scene:Scene){
        const thing = (await SceneLoader.ImportMeshAsync(null, './assets/missile.glb', '', scene));

        Missile.shipModel = thing.meshes[0];
        Util.setVisibility(Missile.shipModel, false);
    }

    createMesh() {
        this.mesh = Missile.shipModel!.clone("", null);
        Util.setVisibility(this.mesh!, true);

        this.mesh!.physicsImpostor = new PhysicsImpostor(this.mesh!, PhysicsImpostor.ConvexHullImpostor, {
            mass: 1,
        } as any);
    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh!.rotationQuaternion!.toRotationMatrix(Util.mat);
        this.aimPoint = this.mesh!.position.add(Vector3.TransformCoordinates(new Vector3(0,0,40), Util.mat));
    }

    getDamageOnHit(){
        return 5;
    }

    update(delta: number) {
        super.update(delta);

        let target:SquidThing|null = null;
        let nearestTargetDist = 1000000;

        for (const a of this.actorManager!.actors){
            if (a instanceof SquidThing){
                const dist = a.model!.position.subtract(this.mesh!.position).length();
                if (dist < nearestTargetDist){
                    target = a;
                    nearestTargetDist = dist;
                }
            }
        }

        if (target){
            const aimPointDelta = target.model!.position.subtract(this.aimPoint);

            const AIM_POINT_MOVE_SPEED = 30 * delta;

            if (aimPointDelta.length() < AIM_POINT_MOVE_SPEED){
                this.aimPoint.copyFrom(target.model!.position);
            } else {
                this.aimPoint.addInPlace(aimPointDelta.normalize().scale(AIM_POINT_MOVE_SPEED));
            }

            this.mesh!.lookAt(this.aimPoint);
        }

        this.mesh!.rotationQuaternion!.toRotationMatrix(Util.mat);
        this.mesh!.physicsImpostor!.setLinearVelocity(Vector3.TransformCoordinates(new Vector3(0,0,50), Util.mat));
    }
}
