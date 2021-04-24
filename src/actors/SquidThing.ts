import {Actor} from "../am/Actor";
import {AbstractMesh} from "@babylonjs/core/Meshes/abstractMesh";
import {Scene} from "@babylonjs/core/scene";
import {SceneLoader} from "@babylonjs/core/Loading/sceneLoader";
import {Matrix, Vector2, Vector3} from "@babylonjs/core/Maths/math.vector";
import {Util} from "../util/Util";
import {PhysicsImpostor} from "@babylonjs/core/Physics/physicsImpostor";
import {Constants} from "../util/Constants";
import {Damagable} from "./Damagable";
import {PlayerShip} from "./PlayerShip";

export class SquidThing extends Actor implements Damagable {
    static shipModel:AbstractMesh|null = null;

    hp:number = 3;

    weaponCharge = 0;

    static async preload(scene: Scene){
        const thing = (await SceneLoader.ImportMeshAsync(null, './assets/squid_thing.glb', '', scene));

        SquidThing.shipModel = thing.meshes[0];
        Util.setVisibility(SquidThing.shipModel, false);
    }

    public model:AbstractMesh|null = null;

    constructor(private startLoc:Vector3) {
        super();
    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.model = SquidThing.shipModel!.clone("", null)!;
        Util.setVisibility(this.model, true);

        this.model!.physicsImpostor = new PhysicsImpostor(this.model!, PhysicsImpostor.ConvexHullImpostor, {mass: 10, group: Constants.COLLISION_GROUP_ENEMY, mask: Constants.COLLISION_GROUP_ENEMY | Constants.COLLISION_GROUP_PLAYER_SHOT | Constants.COLLISION_GROUP_PLAYER } as any);
        this.model!.position.copyFrom(this.startLoc);
    }

    exitingView() {
        super.exitingView();

        this.model!.dispose();
    }

    getPos(): Vector3 {
        return this.model!.position.clone();
    }

    getFaction(): number {
        return 1;
    }

    takeDamage(amt: number) {

        this.hp -= amt;
        console.log(`took ${amt} damage ${this.hp} left`)
    }

    keep(): boolean {
        return super.keep() && this.hp > 0;
    }

    update(delta: number) {
        super.update(delta);

        this.weaponCharge += delta;

        if (this.weaponCharge > 2){
            const playerShips = this.actorManager!.actors.filter(it => it instanceof PlayerShip);

            if (playerShips.length > 0){
                const playerShip = playerShips[0] as PlayerShip;

                if (playerShip.model!.position.subtract(this.model!.position).length() < 70){
                    this.model!.rotationQuaternion!.toRotationMatrix(Util.mat);
                    const forwardVector = Vector3.TransformCoordinates(Vector3.Forward(false), Util.mat);
                    forwardVector.normalize();

                    const toPlayerVector = playerShip.model!.position.subtract(this.model!.position);
                    toPlayerVector.normalize();

                    const turnQuat = Util.rotationBetweenVectors(forwardVector, toPlayerVector, 1 * delta);
                    console.log(`${turnQuat}`)

                    this.model!.lookAt(playerShip.model!.position);

                    this.model!.rotationQuaternion = this.model!.rotationQuaternion!.multiply(turnQuat);
                }
            }
        }
    }


}
