import { ServerGame } from "./multiplayer/ServerGame";

//global.XMLHttpRequest = require('xhr2').XMLHttpRequest;

const fs = require('fs')

global.XMLHttpRequest = function(){
    const ret:any = {}

    let loadEndHandler:CallableFunction|null = null
    let readyStateChange:CallableFunction|null = null
    let targetUrl:string|null = null

    ret.open = (method:string, url:string) => {
        console.log(`${method} ${url}`)
        targetUrl = url
    }

    ret.addEventListener = (type:any, listener:any) => {
        console.log(`addEventListener ${type} ${listener}`)

        if (type == 'loadend') loadEndHandler = listener
        else if (type == 'readystatechange') readyStateChange = listener
        else throw new Error(`Unregonized event ${type}`)
    }

    ret.removeEventListener = (type:any) => {
        console.log(`removeEventListener ${type}`)

        if (type == 'loadend') loadEndHandler = null
        else if (type == 'readystatechange') readyStateChange = null
        else throw new Error(`Unregonized event ${type}`)
    }

    ret.send = () => {
        console.log('send')

        ret.responseText = null
        ret.readyState = null
        ret.status = null

        const readStream = fs.createReadStream(targetUrl)

        let fileContent = ''

        readStream.on('data', (data:string) => { fileContent += data; })

        readStream.on('end', () => {
            console.log(`Load is complete, got ${fileContent.length} characters`)

            ret.responseText = fileContent
            ret.readyState = global.XMLHttpRequest.DONE
            ret.status = 200

            if (!loadEndHandler) throw new Error('Expected a loadend handler')
            if (!readyStateChange) throw new Error('Expected a readyStateChange handler')

            loadEndHandler()
            readyStateChange()
        })
    }

    return ret
} as any

(global.XMLHttpRequest as any).DONE = 1;

const serverGame = new ServerGame('')
serverGame.doRender()