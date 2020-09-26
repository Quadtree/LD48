import { BaseDriver } from "./drivers/BaseDriver";
import { BaseChannel, ChannelStatus } from "./drivers/BaseChannel";
import { ActorManager } from "../am/ActorManager";
import { ActorManagerPlugin } from "../am/ActorManagerPlugin";
import { Actor } from "../am/Actor";
import { isReplicated, getTypeName, buildByName, getReplicationFieldsOf } from "./annotations/Replicated";
import { enhanceWithRPC, getRPCModeForFunction, RPCMode } from "./annotations/RPC";

class ClientHandler
{
    constructor(
        public channel:BaseChannel,
        public id:number,
        private clientPrivateID:number,
        private serverPrivateID:number
    ){
        const hello:ServerHelloMessage = {
            type: MessageType.ServerHello,
            id: this.id,
            clientPrivateID: this.clientPrivateID,
            serverPrivateID: this.serverPrivateID
        }

        this.channel.send(JSON.stringify(hello))
    }

    public get keep():boolean {
        if (this.channel.status == ChannelStatus.Disconnected) return false
        return true
    }

    public update(){

    }

    public send(msg:BaseMessage){
        msg.secret = this.serverPrivateID

        this.channel.send(JSON.stringify(msg))
    }

    public recv():string|null {
        const msg = this.channel.recv()

        if (msg == null) return null

        const data = JSON.parse(msg) as BaseMessage

        if (data.secret != this.clientPrivateID) return null

        return msg
    }
}

// every client has an ID
// they also have a privateID that they prefix all messages they send to the server with
// every actor has a NetOwnerID. Every actor also has an ID

enum MessageType
{
    ServerHello,            // message from the server telling the client its ID and such
    RemoteProcedureCall,    // RPC. clients and servers can send these. if the server gets one and the type is broadcast, it broadcasts it
    Replicate               // replication message. always server to client
}

export enum NetworkManagerMode
{
    None,
    Server,
    Client
}

interface BaseMessage
{
    type:MessageType
    secret?:number
}

interface ServerHelloMessage extends BaseMessage
{
    id:number
    clientPrivateID:number
    serverPrivateID:number
}

interface ReplicatePayload
{
    // ID of the actor who is being changed
    actorId:number

    type:string

    // fields to be updated
    fields:{[key:string]:any}
}

interface ReplicateMessage extends BaseMessage
{
    payload:ReplicatePayload[]
}

interface RPCMessage extends BaseMessage
{
    actorId:number

    funcName:string

    args:any[]
}


export class NetworkManager implements ActorManagerPlugin {
    public mode = NetworkManagerMode.None

    // the handlers for each client, if we're the server
    private clients:ClientHandler[] = []
    private nextID:number = 2

    // the channel connecting us to the server, if we're the client
    private channel:BaseChannel|null = null
    private clientPrivateID:number|null = null
    private serverPrivateID:number|null = null
    private id:number|null = null

    public debug:boolean = false

    private frameNumber:number = 0

    public clientConnectedCallbacks:CallableFunction[] = []
    public clientDisconnectedCallbacks:CallableFunction[] = []

    constructor(private driver:BaseDriver, private actorManager:ActorManager){
        actorManager.addPlugin(this)
    }

    private generateRandomID(){
        return Math.floor(Math.random() * 1000000); // @TODO: Secure source of randomness
    }

    public connect(url:string){
        if (this.mode != NetworkManagerMode.None) throw new Error('Cannot connect unless we are in mode None')

        this.mode = NetworkManagerMode.Client

        this.channel = this.driver.connect(url)
    }

    public listen(){
        if (this.mode != NetworkManagerMode.None) throw new Error('Cannot listen unless we are in mode None')

        this.mode = NetworkManagerMode.Server
        this.driver.listen((channel:BaseChannel) => {
            this.clients.push(new ClientHandler(channel, this.nextID++, this.generateRandomID(), this.generateRandomID()))
            console.log(`Client connected. Assigned ID ${this.clients[this.clients.length - 1].id}`)

            this.clientConnectedCallbacks.forEach((it:CallableFunction) => it(this.clients[this.clients.length - 1].id))
        })
    }

    private clientValidateMessage(msg:BaseMessage){
        return msg.secret == this.serverPrivateID;
    }

    public update(){
        if (this.mode == NetworkManagerMode.Client){
            if (!this.channel) throw new Error('We are in client mode, but we have no channel?')

            // we're the client
            let nxtMsg:string|null = null
            while(nxtMsg = this.channel.recv()){
                if (this.debug) console.log(`Client ${this.id} received message: ${nxtMsg}`)

                const data = JSON.parse(nxtMsg) as BaseMessage

                if (data.type == MessageType.ServerHello){
                    const message = data as ServerHelloMessage

                    this.clientPrivateID = message.clientPrivateID
                    this.serverPrivateID = message.serverPrivateID
                    this.id = message.id

                    if (this.debug) console.log(`Client has received hello and is configured. clientPrivateID=${this.clientPrivateID} serverPrivateID=${this.serverPrivateID} id=${this.id}`)
                }

                if (data.type == MessageType.Replicate && this.clientValidateMessage(data)){
                    const message = data as ReplicateMessage

                    for (let p of message.payload){
                        let trgActor:Actor|null = this.actorManager.getActorById(p.actorId)
                        if (trgActor == null){
                            if (this.debug) console.log(`Actor with id ${p.actorId} not found, creating`)
                            trgActor = buildByName(p.type)
                            if (!trgActor) throw new Error(`Could not build actor of type ${p.type}`)
                            trgActor.netID = p.actorId
                            if (this.debug) console.log(`Created a ${trgActor.constructor.name}`)
                            this.actorManager.add(trgActor)
                        }

                        const replicatedFields = getReplicationFieldsOf(trgActor)

                        for (let k in p.fields){
                            if (replicatedFields.indexOf(k) != -1){
                                (trgActor as any)[k] = p.fields[k]
                            }
                        }
                    }
                }

                if (data.type == MessageType.RemoteProcedureCall && this.clientValidateMessage(data)){
                    if (this.debug) console.log(`Client received RPC`)
                    const message = data as RPCMessage

                    let trgActor:Actor|null = this.actorManager.getActorById(message.actorId)

                    if (trgActor){
                        const mode = getRPCModeForFunction(trgActor, message.funcName)

                        if (this.debug) console.log(`Routing RPC to ${trgActor}`);

                        if (mode != null && mode == RPCMode.RunOnAll){
                            (trgActor as any)[`_NON_RPC_${message.funcName}`](...message.args)
                        }

                    } else {
                        if (this.debug) console.log(`Actor with ${message.actorId} does not exist`);
                    }
                }
            }
        }

        if (this.mode == NetworkManagerMode.Server){
            if (this.debug) console.log(`update() in server mode. actor count = ${this.actorManager.actors.length}`)
            this.clients = this.clients.filter(it => it.keep)

            this.clients.forEach(it => it.update())


            if ((this.frameNumber++) % 20 == 0){
                const payloads:ReplicatePayload[] = this.actorManager.actors
                    .filter(it => isReplicated(it))
                    .map((it):ReplicatePayload => {
                        const fields:{[key:string]:any} = {}

                        for (let fieldName of getReplicationFieldsOf(it)){
                            fields[fieldName] = (it as any)[fieldName]
                        }

                        return {type: getTypeName(it), actorId: it.netID, fields: fields}
                    })

                const replicationMessage:ReplicateMessage = {
                    type: MessageType.Replicate,
                    payload: payloads
                }

                this.clients.forEach(it => it.send(replicationMessage))
            }

            for (let client of this.clients){
                let nxtMsg:string|null = null
                while(nxtMsg = client.recv()){
                    if (this.debug) console.log(`Server received message from ${client.id}: ${nxtMsg}`)

                    const data = JSON.parse(nxtMsg) as BaseMessage

                    if (data.type == MessageType.RemoteProcedureCall){
                        // TODO: Check that client sent proper secret
                        if (this.debug) console.log(`Server received RPC`)
                        const message = data as RPCMessage

                        let trgActor:Actor|null = this.actorManager.getActorById(message.actorId)

                        if (trgActor && trgActor.netOwnerID == client.id){
                            const mode = getRPCModeForFunction(trgActor, message.funcName)

                            if (this.debug) console.log(`Routing RPC to ${trgActor}`);

                            if (mode != null && [RPCMode.RunOnServer, RPCMode.RunOnAll].indexOf(mode) != -1){
                                (trgActor as any)[`_NON_RPC_${message.funcName}`](...message.args)
                            }

                            if (mode == RPCMode.RunOnAll){
                                this.sendRPCCallToClients(this.clients.filter(it => it != client), trgActor, message.funcName, message.args)
                            }

                        } else {
                            if (this.debug) console.log(`Actor with ${message.actorId} does not exist`);
                        }
                    }
                }
            }
        }
    }

    actorCreated(actor:Actor):void {
        enhanceWithRPC(actor, this)
    }

    public sendRPCCallToServer(actor:Actor, funcName:string, args:any[]){
        if (this.debug) console.log(`sendRPCCallToServer ${actor.netID} ${funcName} ${args}`)

        if (this.mode != NetworkManagerMode.Client) throw new Error('we should be in client mode to do this')

        if (!this.clientPrivateID) throw new Error('We need to have a private ID to send messages')

        const message:RPCMessage = {
            type: MessageType.RemoteProcedureCall,
            actorId: actor.netID,
            funcName: funcName,
            secret: this.clientPrivateID,
            args: args
        }

        if (!this.channel) throw new Error('this.channel must exist for this to work')

        this.channel.send(JSON.stringify(message))
    }

    public sendRPCCallToAllClients(actor:Actor, funcName:string, args:any[]){
        this.sendRPCCallToClients(this.clients, actor, funcName, args)
    }

    public sendRPCCallToClients(clients:ClientHandler[], actor:Actor, funcName:string, args:any[]){
        if (this.debug) console.log(`sendRPCCallToClients ${clients.map(it => it.id)} ${actor.netID} ${funcName} ${args}`)

        if (this.mode != NetworkManagerMode.Server) throw new Error('we should be in server mode to do this')

        const message:RPCMessage = {
            type: MessageType.RemoteProcedureCall,
            actorId: actor.netID,
            funcName: funcName,
            args: args
        }

        clients.forEach(it => it.send(message))
    }

    public forceReplication(){
        this.frameNumber = 0
    }
}