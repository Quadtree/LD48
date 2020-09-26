import { BaseDriver, ChannelCallback } from "../BaseDriver";
import { WSNetChannel } from "./WSNetChannel";

export class WSNetDriver extends BaseDriver
{
    public connect(url:string){
        const conWS = new WebSocket(url)
        return new WSNetChannel(conWS)
    }
}