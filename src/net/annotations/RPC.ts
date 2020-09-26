import { Actor } from "../../am/Actor";
import { getTypeName } from "./Replicated";
import { NetworkManager, NetworkManagerMode } from "../NetworkManager";

const rpcMode:{[key:string]:{[key:string]:RPCMode}} = {}

export enum RPCMode {
    RunOnServer,
    RunOnAll
}

export function enhanceWithRPC(actor:Actor, networkManager:NetworkManager){
    if (!actor) throw new Error('actor cannot be null')

    const typeName = getTypeName(actor)

    if (!rpcMode[typeName]) return

    for (let funcName in rpcMode[typeName]){
        // for each function, replace it with a shim

        if (rpcMode[typeName][funcName] == RPCMode.RunOnServer){
            const origFunc = (actor as any)[funcName];

            if (!actor) throw new Error('actor cannot be null');

            (actor as any)[`_NON_RPC_${funcName}`] = function(...args:any[]) { return origFunc.apply(actor, args); };

            (actor as any)[funcName] = function(...args:any[]){
                if (networkManager.mode == NetworkManagerMode.Server){
                    // we are the server. no need for any shim
                    origFunc.apply(actor, args)
                } else {
                    networkManager.sendRPCCallToServer(actor, funcName, args)
                }
            }
        }

        if (rpcMode[typeName][funcName] == RPCMode.RunOnAll){
            const origFunc = (actor as any)[funcName];

            if (!actor) throw new Error('actor cannot be null');

            (actor as any)[`_NON_RPC_${funcName}`] = function(...args:any[]) { return origFunc.apply(actor, args); };

            (actor as any)[funcName] = function(...args:any[]){
                if (networkManager.mode == NetworkManagerMode.Server){
                    origFunc.apply(actor, args)
                    networkManager.sendRPCCallToAllClients(actor, funcName, args)
                } else {
                    origFunc.apply(actor, args)
                    networkManager.sendRPCCallToServer(actor, funcName, args)
                }
            }
        }
    }
}

export function getRPCModeForFunction(actor:Actor, funcName:string):RPCMode|null{
    return rpcMode[getTypeName(actor)][funcName]
}

export function runOnServer(prototype:any, name:string){
    console.log(`RPC ${prototype.constructor.name} ${name}`)

    if (!rpcMode[prototype.constructor.name]) rpcMode[prototype.constructor.name] = {}

    rpcMode[prototype.constructor.name][name] = RPCMode.RunOnServer
}

export function runOnAll(prototype:any, name:string){
    console.log(`RPCall ${prototype.constructor.name} ${name}`)

    if (!rpcMode[prototype.constructor.name]) rpcMode[prototype.constructor.name] = {}

    rpcMode[prototype.constructor.name][name] = RPCMode.RunOnAll
}