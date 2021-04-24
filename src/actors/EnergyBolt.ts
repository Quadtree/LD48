import { Actor } from "../am/Actor";
import {Scene} from "@babylonjs/core/scene";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {Matrix, Quaternion, Vector3} from "@babylonjs/core/Maths/math.vector";
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor";
import {Constants} from "../util/Constants";

export class EnergyBolt extends Actor {
    private mesh:AbstractMesh|null = null;

    private timeToLive = 4;

    constructor(private readonly startPos:Vector3, private readonly angle:Quaternion) {
        super();
    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = MeshBuilder.CreateBox("", {width: 0.25, depth: 2, height: 0.25});

        this.mesh.position = this.startPos;
        this.mesh.rotationQuaternion = this.angle;

        this.mesh.physicsImpostor = new PhysicsImpostor(this.mesh!, PhysicsImpostor.BoxImpostor, {mass: 1, group: Constants.COLLISION_GROUP_PLAYER_SHOT, mask: Constants.COLLISION_GROUP_ENEMY} as any);

        const rotMat = new Matrix();
        this.mesh.rotationQuaternion.toRotationMatrix(rotMat);

        this.mesh.physicsImpostor.setLinearVelocity(Vector3.TransformCoordinates(Vector3.Forward(false), rotMat).scale(120));

        this.mesh.physicsImpostor.onCollideEvent = (self, other) => {
            if ((other as any).takeDamage){
                console.log("DMG");
                this.timeToLive = -1000;
                (other as any).takeDamage(1);
            }
        }

        this.mesh.physicsImpostor.registerOnPhysicsCollide(this.mesh.physicsImpostor, collider => null);
    }

    exitingView() {
        super.exitingView();

        this.mesh!.dispose();
    }

    update(delta: number) {
        super.update(delta);

        this.timeToLive -= delta;
    }

    keep(): boolean {
        return super.keep() && this.timeToLive > 0;
    }
}
