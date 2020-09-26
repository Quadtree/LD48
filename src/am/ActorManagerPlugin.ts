import { Actor } from "./Actor";

export interface ActorManagerPlugin
{
    actorCreated(actor:Actor):void;
    update():void;
}