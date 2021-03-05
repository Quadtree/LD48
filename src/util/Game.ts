import { GameManager } from "./GameManager";

export interface Game
{
    init(gameManager:GameManager):Promise<void>;

    update(delta:number):void;
}