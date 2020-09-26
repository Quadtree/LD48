import { BaseChannel, ChannelStatus } from "../BaseChannel";
import { BaseDriver, ChannelCallback } from "../BaseDriver";

class LocalNetServerChannel extends BaseChannel
{
    public queue:string[] = []

    constructor(public clientChannel:LocalNetClientChannel){
        super()
        clientChannel.serverChannel = this
    }

    public get status():ChannelStatus {
        return ChannelStatus.Connected
    }

    public send(msg:string){
        if (!this.clientChannel) throw new Error('clientChannel cannot be null')
        this.clientChannel.queue.push(msg)
    }

    public recv():string|null {
        if (this.queue.length > 0){
            const ret = this.queue[0]
            this.queue.splice(0, 1)
            return ret
        }
        return null
    }
}

class LocalNetClientChannel extends BaseChannel
{
    public queue:string[] = []

    public serverChannel:LocalNetServerChannel|null = null

    public get status():ChannelStatus {
        return ChannelStatus.Connected
    }

    public send(msg:string){
        if (!this.serverChannel) throw new Error('serverChannel cannot be null')
        this.serverChannel.queue.push(msg)
    }

    public recv():string|null {
        if (this.queue.length > 0){
            const ret = this.queue[0]
            this.queue.splice(0, 1)
            return ret
        }
        return null
    }
}

export class LocalNetDriver extends BaseDriver
{
    private channelCallback:ChannelCallback|null = null

    public listen(channelCallback:ChannelCallback){
        if (this.channelCallback) throw new Error("Can't listen twice")

        this.channelCallback = channelCallback
    }

    public connect(url:string):BaseChannel {
        const clientChannel = new LocalNetClientChannel()
        const serverChannel = new LocalNetServerChannel(clientChannel)

        if (!this.channelCallback) throw new Error('this.channelCallback cannot be null')

        this.channelCallback(serverChannel)

        return clientChannel
    }
}