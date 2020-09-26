import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { BaseGame } from "./BaseGame";
import { NetworkManager } from "../net/NetworkManager";
import { WSNodeNetDriver } from "../net/drivers/wsnode/WSNodeNetDriver";
import { BoxActor } from "./BaseGame"

export class ServerGame extends BaseGame
{
    protected createEngine(canvasElement : string){
        this._engine = new NullEngine()
    }

    protected attachCamera(){

    }

    constructor(canvasElement : string) {
        super(canvasElement)

        if (!this.actorManager) throw new Error('expected an actor manager')

        this.actorManager.isInView = false
        this.createWorld = true

        const netMgr = new NetworkManager(new WSNodeNetDriver(), this.actorManager)
        netMgr.listen()
        netMgr.clientConnectedCallbacks.push((id:number) => {
            const newBoxActor = new BoxActor()
            newBoxActor.netOwnerID = id
            newBoxActor.pos.x = (Math.random() - 0.5) * 10
            newBoxActor.pos.y = (Math.random() - 0.5) * 10
            this.actorManager?.add(newBoxActor)
        })
    }
}