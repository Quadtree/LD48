import { Actor } from "../am/Actor";
import {Scene} from "@babylonjs/core/scene";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {Matrix, Quaternion, Vector3} from "@babylonjs/core/Maths/math.vector";
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor";

export class EnergyBolt extends Actor {
    private mesh:AbstractMesh|null = null;

    constructor(private readonly startPos:Vector3, private readonly angle:Quaternion) {
        super();
    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = MeshBuilder.CreateBox("", {width: 0.25, depth: 2, height: 0.25});

        this.mesh.position = this.startPos;
        this.mesh.rotationQuaternion = this.angle;

        this.mesh.physicsImpostor = new PhysicsImpostor(this.mesh!, PhysicsImpostor.BoxImpostor, {mass: 1});

        const rotMat = new Matrix();
        this.mesh.rotationQuaternion.toRotationMatrix(rotMat);

        this.mesh.physicsImpostor.setLinearVelocity(Vector3.TransformCoordinates(Vector3.Forward(false), rotMat).scale(120));
    }

    update(delta: number) {
        super.update(delta);
    }
}
