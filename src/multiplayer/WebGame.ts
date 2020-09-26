import { Engine } from "@babylonjs/core/Engines/engine";
import { BaseGame } from "./BaseGame";
import { NetworkManager } from "../net/NetworkManager";
import { WSNetDriver } from "../net/drivers/ws/WSNetDriver";

export class WebGame extends BaseGame
{
    protected createEngine(canvasElement : string){
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new Engine(this._canvas, true);
    }

    protected attachCamera(){
        if (!this._canvas) throw new Error('Canvas cannot be null')

        this._camera.attachControl(this._canvas, false);
    }

    constructor(canvasElement : string) {
        super(canvasElement)

        if (!this.actorManager) throw new Error('expected an actor manager')

        new NetworkManager(new WSNetDriver(), this.actorManager).connect('ws://localhost:8081/')
    }

    doRender(){
        super.doRender()

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine?.resize();
        });
    }
}