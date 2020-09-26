import { Scene } from "@babylonjs/core/scene";
import { ActorManager } from "./ActorManager";

export class Actor
{
    private actorManager:ActorManager|null = null;

    public netOwnerID = 1
    public netID = Math.floor(Math.random() * 1000000)

    constructor(){
    }

    // this actor was just created (and not deserialized)
    public created(actorManager:ActorManager){
        this.actorManager = actorManager;
    }

    // this actor is entering the current view, and this manager is not running in headless mode
    public enteringView(scene:Scene){}

    // this actor is leaving the current view
    public exitingView(){}

    // this actor is entering the world. we might be in headless mode, and we might have just been deserialized
    public enteringWorld(){}

    // this actor is exiting the world
    public exitingWorld(){}

    // this actor has been destroyed. this is the final step
    public destroyed(){}

    // called every frame...
    public update(delta:number){}

    // whether or not we should keep this actor or destroy it
    public keep():boolean
    {
        return true;
    }
}