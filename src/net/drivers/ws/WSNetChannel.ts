import { BaseChannel, ChannelStatus } from '../BaseChannel';

export class WSNetChannel extends BaseChannel
{
    private messages:string[] = []

    constructor(private socket:WebSocket){
        super()

        this.socket.onmessage = (ev:MessageEvent) => {
            this.messages.push(ev.data)
        }
    }

    public get status():ChannelStatus {
        if (this.socket.readyState == WebSocket.CONNECTING) return ChannelStatus.Connecting
        if (this.socket.readyState == WebSocket.OPEN) return ChannelStatus.Connected
        return ChannelStatus.Disconnected
    }

    public send(msg:string){
        this.socket.send(msg)
    }

    public recv():string|null {
        if (this.messages.length > 0){
            const ret = this.messages[0]
            this.messages.splice(0, 1)
            return ret
        }

        return null
    }
}