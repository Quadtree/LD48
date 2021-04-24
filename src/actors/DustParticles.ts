import {Actor} from "../am/Actor";
import {Scene} from "@babylonjs/core/scene";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {InstancedMesh, Mesh, StandardMaterial} from "@babylonjs/core/index";
import {Matrix, Quaternion, Vector2, Vector3} from "@babylonjs/core/Maths/math.vector";
import {Asteroid} from "./Asteroid";

const RADIUS = 80;
const NUM = 140;

class DustParticle {
    constructor(private inst:InstancedMesh) {
        inst.position.x = 1000000;
    }

    init(camPos:Vector3){
        const angle = Quaternion.FromEulerAngles(Math.random() * 360, Math.random() * 360, Math.random() * 360);
        const vec = new Vector3(0, 0, Math.random() * RADIUS);
        const mat = new Matrix();
        angle.toRotationMatrix(mat);

        this.inst.position = camPos.add(Vector3.TransformCoordinates(vec, mat));
    }

    update(delta:number, camPos:Vector3){
        if (this.inst.position.subtract(camPos).length() > RADIUS){
            const angle = Quaternion.FromEulerAngles(Math.random() * 360, Math.random() * 360, Math.random() * 360);
            const vec = new Vector3(0, 0, RADIUS * 0.9);
            const mat = new Matrix();
            angle.toRotationMatrix(mat);

            this.inst.position = camPos.add(Vector3.TransformCoordinates(vec, mat));
        }
    }
}

export class DustParticles extends Actor {
    private particles:DustParticle[] = [];

    private readonly num = NUM;

    private mesh:Mesh|null = null;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = MeshBuilder.CreatePlane("", {height: 0.5, width: 0.5});
        this.mesh.position.x = 1000000;
        this.mesh.billboardMode = Mesh.BILLBOARDMODE_ALL;

        const mat = new StandardMaterial("", scene);
        mat.emissiveTexture = Asteroid.texture;

        this.mesh.material = mat;

        for (let i=0;i<this.num;++i){

            this.particles.push(new DustParticle(this.mesh.createInstance("")));
        }
    }

    update(delta: number) {
        super.update(delta);

        const camPos = this.actorManager?.scene?.activeCamera?.position;
        if (camPos){
            this.mesh!.isVisible = true;
            this.particles.forEach(it => it.update(delta, camPos));
        } else {
            this.mesh!.isVisible = false;
        }
    }
}
