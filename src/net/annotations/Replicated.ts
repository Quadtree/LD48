import { Actor } from "../../am/Actor"

const repl:{[key:string]:{[key:string]:boolean}} = {}
const constructors:{[key:string]:any} = {}

export function isReplicated(instance:Actor){
    //console.log(`Checking if ${getTypeName(instance)} is replicated`)
    const ret = repl[getTypeName(instance)] != null
    //console.log(`answer=${ret}`)
    return ret
}

export function getTypeName(instance:Actor){
    if (instance == null) throw new Error('instance cannot be null')

    return (instance as any).constructor.name
}

export function buildByName(typeName:string){
    return Reflect.construct(constructors[typeName], [])
}

export function getReplicationFieldsOf(instance:Actor):string[]{
    const keys:string[] = []

    for (let k in repl[getTypeName(instance)]) keys.push(k)

    return keys
}

export function replicated(prototype:any, name:string){
    console.log(`replicated ${prototype.constructor.name} ${name}`)

    if (!repl[prototype.constructor.name]) repl[prototype.constructor.name] = {}

    repl[prototype.constructor.name][name] = true

    constructors[prototype.constructor.name] = prototype.constructor
}