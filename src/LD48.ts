import { Game } from "./util/Game";
import { GameManager } from "./util/GameManager";

export class LD48 implements Game {
    async init(gameManager:GameManager):Promise<void> {
        console.log("init()");
    }

    update(delta:number):void {
        console.log(`update(${delta})`);
    }
}