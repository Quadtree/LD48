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
import {Trackable} from "./Trackable";
import {Color4, Sound, StandardMaterial} from "@babylonjs/core";
import {Spawnable, SpawnableTypes} from "./Spawnable";
import {LD48} from "../LD48";
import {Explosion} from "./Explosion";
import {Color3} from "@babylonjs/core/index";

export class SquidThing extends Actor implements Damagable, Trackable, Spawnable {
    static shipModel:AbstractMesh|null = null;

    hp:number = 2 + LD48.s!.difficulty / 2;

    weaponCharge = 0;

    aimPoint:Vector3 = new Vector3(0,0,0);

    killedByDamage = false

    static destroyedSound:Sound|null = null;

    static async preload(scene: Scene){
        const thing = (await SceneLoader.ImportMeshAsync(null, './assets/squid_thing.glb', '', scene));

        SquidThing.shipModel = thing.meshes[0];
        Util.setVisibility(SquidThing.shipModel, false);

        SquidThing.destroyedSound = await Util.loadSound("assets/enemydestroyed.wav", scene);
    }

    public model:AbstractMesh|null = null;

    constructor(private startLoc:Vector3) {
        super();
    }

    getAttackCooldown(){
        return 2.6 - LD48.s!.difficulty * .2;
    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.model = this.getModelTemplate().clone("", null)!;
        Util.setVisibility(this.model, true);

        this.model!.physicsImpostor = new PhysicsImpostor(this.model!, PhysicsImpostor.ConvexHullImpostor, {
            mass: 5,
        } as any);
        this.model!.position.copyFrom(this.startLoc);

        this.aimPoint.copyFrom(this.startLoc);

        this.model!.physicsImpostor.registerOnPhysicsCollide(this.model!.physicsImpostor, collider => null);
    }

    protected getModelTemplate(){
        return SquidThing.shipModel!;
    }

    exitingView() {
        super.exitingView();

        this.model!.dispose();

        if (this.killedByDamage){
            SquidThing.destroyedSound!.play();
            this.actorManager!.add(new Explosion(this.model!.position.clone(), this.getExplosionSize(), new Color3(1,0,1)))
        }
    }

    getExplosionSize(){
        return 8;
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

        if (this.hp <= 0){
            this.killedByDamage = true
        }
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

                if (inFiringPosition){
                    this.fireWeapon(playerShip);
                }
            }
        }


        const moveDelta = this.aimPoint.subtract(this.model!.position)
        if (moveDelta.length() > 120) {
            this.model!.physicsImpostor!.setLinearVelocity(moveDelta.normalize().scaleInPlace(this.getTurboSpeed()));
        } else if (moveDelta.length() > 40) {
            this.model!.physicsImpostor!.setLinearVelocity(moveDelta.normalize().scaleInPlace(this.getBaseSpeed()));
        } else {
            this.model!.physicsImpostor!.setLinearVelocity(moveDelta.normalize().scaleInPlace(0));
        }
    }

    protected fireWeapon(playerShip:PlayerShip){
        if (this.weaponCharge > this.getAttackCooldown()){
            const angle = Util.rotationBetweenVectors(Vector3.Forward(false), playerShip.model!.position.subtract(this.model!.position));

            angle.toRotationMatrix(Util.mat);

            this.actorManager!.add(new EnergyBolt(this.model!.position.add(Vector3.TransformCoordinates(Vector3.Forward(false), Util.mat).scaleInPlace(5)), angle, 1, 140));

            this.weaponCharge = 0;
        }
    }

    protected getBaseSpeed(){
        return 10;
    }

    protected getTurboSpeed(){
        return 60;
    }

    getMesh(): AbstractMesh {
        return this.model!;
    }

    getColor(): Color4 {
        return new Color4(1,0,0,1);
    }

    isActivelyTrackable(): boolean {
        return true;
    }

    getText(): string {
        return "?";
    }

    getSpawnableType(): string {
        return SpawnableTypes.TYPE_SQUIDTHING;
    }

    despawn() {
        this.hp = -10000;
        return true;
    }
}
