import { Actor } from "../am/Actor";
import {Scene} from "@babylonjs/core/scene";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {Matrix, Quaternion, Vector3} from "@babylonjs/core/Maths/math.vector";
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor";
import {Constants} from "../util/Constants";

export class EnergyBolt extends Actor {
    mesh:AbstractMesh|null = null;

    timeToLive = 4;

    constructor(private readonly startPos:Vector3, private readonly angle:Quaternion, private readonly faction:number = 0, private readonly speed:number = 120) {
        super();
    }

    createMesh(){
        this.mesh = MeshBuilder.CreateBox("", {width: 0.25, depth: 2, height: 0.25});

        this.mesh!.physicsImpostor = new PhysicsImpostor(this.mesh!, PhysicsImpostor.BoxImpostor, {
            mass: 1,
        } as any);
    }

    getDamageOnHit(){
        return 1;
    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.createMesh();

        this.mesh!.position = this.startPos;
        this.mesh!.rotationQuaternion = this.angle;



        console.log(`shot group ${this.faction == 0 ? Constants.COLLISION_GROUP_PLAYER_SHOT : Constants.COLLISION_GROUP_ENEMY_SHOT}`)

        const rotMat = new Matrix();
        this.mesh!.rotationQuaternion.toRotationMatrix(rotMat);

        this.mesh!.physicsImpostor!.setLinearVelocity(Vector3.TransformCoordinates(Vector3.Forward(false), rotMat).scale(this.speed));

        this.mesh!.physicsImpostor!.onCollideEvent = (self, other) => {
            if (this.timeToLive > 0) {
                this.actorManager!.damageAtPoint(this.mesh!.position, this.getDamageOnHit(), 1 - this.faction);

            }
            console.log('collided!');
            this.timeToLive = -1000;
        }

        this.mesh!.physicsImpostor!.registerOnPhysicsCollide(this.mesh!.physicsImpostor!, collider => null);
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
