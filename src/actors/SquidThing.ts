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
import {EnergyBolt} from "./EnergyBolt";

export class SquidThing extends Actor implements Damagable {
    static shipModel:AbstractMesh|null = null;

    hp:number = 3;

    weaponCharge = 0;

    aimPoint:Vector3 = new Vector3(0,0,0);

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

        this.model!.physicsImpostor = new PhysicsImpostor(this.model!, PhysicsImpostor.ConvexHullImpostor, {
            mass: 5,
            group: Constants.COLLISION_GROUP_ENEMY,
            mask: Constants.COLLISION_GROUP_PLAYER_SHOT
        } as any);
        this.model!.position.copyFrom(this.startLoc);

        this.aimPoint.copyFrom(this.startLoc);

        this.model!.physicsImpostor.registerOnPhysicsCollide(this.model!.physicsImpostor, collider => null);
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

        const playerShips = this.actorManager!.actors.filter(it => it instanceof PlayerShip);

        let inFiringPosition = false;

        if (playerShips.length > 0){
            const playerShip = playerShips[0] as PlayerShip;

            if (playerShip.model!.position.subtract(this.model!.position).length() < 400){
                const aimPointSpeed = playerShip.model!.position.subtract(this.model!.position).length() * delta * 0.8;
                //console.log(aimPointSpeed);
                const aimPointMoveTarget = playerShip.model!.position.subtract(this.aimPoint);

                if (aimPointMoveTarget.length() < 5) inFiringPosition = true;

                if (aimPointMoveTarget.length() > aimPointSpeed) {
                    const aimPointMove = aimPointMoveTarget.normalize().scaleInPlace(aimPointSpeed);
                    this.aimPoint.addInPlace(aimPointMove);
                } else {
                    this.aimPoint.copyFrom(playerShip.model!.position);
                }

                this.model!.lookAt(this.aimPoint);

                //console.log(`${this.aimPoint}`)

                if (this.weaponCharge > 2 && inFiringPosition){
                    const angle = Util.rotationBetweenVectors(Vector3.Forward(false), playerShip.model!.position.subtract(this.model!.position));

                    angle.toRotationMatrix(Util.mat);

                    this.actorManager!.add(new EnergyBolt(this.model!.position, angle, 1, 60));

                    this.weaponCharge = 0;
                }
            }
        }


    }


}
