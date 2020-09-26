import { BaseChannel } from "./BaseChannel";

export interface ChannelCallback
{
    (channel:BaseChannel):void
}

export class BaseDriver
{
    public listen(channelCallback:ChannelCallback){
        throw new Error('Listen is not implemented')
    }

    public connect(url:string):BaseChannel {
        throw new Error('Connect is not implemented')
    }
}