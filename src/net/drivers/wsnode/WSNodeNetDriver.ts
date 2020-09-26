import { BaseDriver, ChannelCallback } from "../BaseDriver";
import * as ws from 'ws'
import { WSNodeNetChannel } from "./WSNodeNetChannel";

export class WSNodeNetDriver extends BaseDriver
{
    public listen(channelCallback:ChannelCallback){
        const server = new ws.Server({port: 80})
        server.on('connection', async (ws:WebSocket) => {
            channelCallback(new WSNodeNetChannel(ws))
        })
    }
}