export enum ChannelStatus {
    Connecting,
    Connected,
    Disconnected,
    Unknown
}

export class BaseChannel {
    public get status():ChannelStatus {
        return ChannelStatus.Unknown
    }

    public send(msg:string){

    }

    public recv():string|null {
        return null
    }
}