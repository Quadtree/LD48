import { Scene } from "@babylonjs/core/scene";
import { Actor } from "./Actor";
import { ActorManagerPlugin } from "./ActorManagerPlugin";
import { Engine } from "@babylonjs/core/Engines/engine";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {Damagable} from "../actors/Damagable";
import {PlayerShip} from "../actors/PlayerShip";

export class ActorManager
{
    private actorManagerPlugins:ActorManagerPlugin[] = []

    public actors = Array<Actor>();

    public scene:Scene|null = null

    private actorAddQueue = Array<Actor>();

    private _isInView = true;

    get isInView(){ return this._isInView; }

    set isInView(value){
        if (value && !this.scene) throw new Error('Scene must be set to bring this into view')

        if (value != this._isInView){
            if (value){
                for (let ac of this.actors){
                    ac.enteringView(this.scene!);
                }
            } else {
                for (let ac of this.actors){
                    ac.exitingView();
                }
            }

            this._isInView = value;
        }
    }

    public update(delta:number){
        if (this._isInView && !this.scene) throw new Error('Scene must be set to bring this into view')

        this.actorManagerPlugins.forEach(it => it.update())

        for (let i=0;i<this.actors.length;++i){
            if (this.actors[i].keep()){
                this.actors[i].update(delta);
            } else {
                if (this._isInView) this.actors[i].exitingView();
                this.actors[i].exitingWorld()
                this.actors[i].destroyed();
                this.actors.splice(i, 1);
                --i;
            }
        }

        for (let ac of this.actorAddQueue){
            //if (this.actors.filter(it => it.netID == ac.netID)) throw new Error('Cannot add an actor with the same netID');

            ac.created(this);
            this.actorManagerPlugins.forEach(it => it.actorCreated(ac))
            ac.enteringWorld()
            if (this._isInView) ac.enteringView(this.scene!);
            this.actors.push(ac);
        }

        this.actorAddQueue = [];
    }

    public add(actor:Actor){
        if (this.getActorById(actor.netID) != null){
            throw new Error('Cannot add an actor with the same netID');
        }

        console.log(`adding actor with id ${actor.netID}`);

        this.actorAddQueue.push(actor);
    }

    public addPlugin(plugin:ActorManagerPlugin){
        this.actorManagerPlugins.push(plugin)
    }

    public getActorById(id:number):Actor|null{
        const poss = this.actors.filter(it => it.netID == id)
        if (poss.length > 0) return poss[0]

        const poss2 = this.actorAddQueue.filter(it => it.netID == id)
        if (poss2.length > 0) return poss2[0]

        console.log(`actor with ID ${id} does NOT exist`);

        return null
    }

    public damageAtPoint(v3:Vector3, amt:number, faction:number){
        let nearest:Damagable|null = null;
        let nearestDist = 10000000;

        for (const a of this.actors){
            if ((a as any).takeDamage){
                const dmg = a as unknown as Damagable;
                if (dmg.getFaction() == faction) {
                    const dist = dmg.getPos().subtract(v3).length();
                    if (dist < nearestDist) {
                        nearest = dmg;
                        nearestDist = dist;
                    }
                }
            }
        }

        if (nearest){
            nearest.takeDamage(amt);
        }
    }

    destroyAllActors(){
        for (let i=0;i<this.actors.length;++i){
            if (this._isInView) this.actors[i].exitingView();
            this.actors[i].exitingWorld()
            this.actors[i].destroyed();
            this.actors.splice(i, 1);
            --i;
        }

        this.actorAddQueue = [];

        console.log(`all actors destroyed: ${this.actors.length}`)
    }

    public get totalActorCount():number {
        return this.actors.length + this.actorAddQueue.length;
    }
}
