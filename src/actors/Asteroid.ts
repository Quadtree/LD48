import {Actor} from "../am/Actor";
import {Scene} from "@babylonjs/core/scene";
import {Texture} from "@babylonjs/core/Materials/Textures/texture";
import {MeshBuilder} from "@babylonjs/core/Meshes/meshBuilder";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {Mesh, StandardMaterial} from "@babylonjs/core/index";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor";
import {Constants} from "../util/Constants";
import {Damagable} from "./Damagable";
import {Spawnable, SpawnableTypes} from "./Spawnable";

export class Asteroid extends Actor implements Damagable, Spawnable {
    public mesh:AbstractMesh|null = null;

    static texture:Texture|null = null;

    alive = true;

    static async preload(scene:Scene){
        this.texture = new Texture("assets/asteroid1.png", scene, true, false, Texture.NEAREST_SAMPLINGMODE);
    }

    constructor(private pos:Vector3) {
        super();
    }


    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.mesh = MeshBuilder.CreateSphere("", {diameter: 4});
        this.mesh.position = this.pos;

        const mat = new StandardMaterial("", scene);
        mat.diffuseTexture = Asteroid.texture;

        this.mesh.material = mat;

        this.mesh!.physicsImpostor = new PhysicsImpostor(this.mesh!, PhysicsImpostor.SphereImpostor, {mass: 100, group: Constants.COLLISION_GROUP_ENEMY, mask: Constants.COLLISION_GROUP_ENEMY | Constants.COLLISION_GROUP_ENEMY_SHOT | Constants.COLLISION_GROUP_PLAYER_SHOT | Constants.COLLISION_GROUP_PLAYER} as any);

        console.log(`radius=${this.mesh!.physicsImpostor!.getRadius()}`);

        (this.mesh!.physicsImpostor as any).takeDamage = (amt:number) => {

        }
        console.log(`asteroid ID=${this.mesh!.physicsImpostor!.uniqueId}`);

        this.mesh!.physicsImpostor!.setLinearVelocity(new Vector3((Math.random() * 2 - 1) * 8, (Math.random() * 2 - 1) * 8, (Math.random() * 2 - 1) * 8));
    }

    exitingView() {
        super.exitingView();

        this.mesh!.dispose();
    }

    takeDamage(amt: number) {
        console.log(`asteroid took ${amt} damage`);
    }

    getFaction(): number {
        return 1;
    }

    getPos(): Vector3 {
        return this.mesh!.position.clone();
    }

    keep(): boolean {
        return super.keep() && this.alive;
    }

    getSpawnableType(): string {
        return SpawnableTypes.TYPE_ASTEROID;
    }

    despawn() {
        this.alive = false;
    }
}
