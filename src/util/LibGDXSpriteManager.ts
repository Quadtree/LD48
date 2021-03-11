import { Scene } from "@babylonjs/core/scene";
import { SpriteManager } from "@babylonjs/core/Sprites/spriteManager";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Tools } from "@babylonjs/core/Misc/tools";

interface SpriteRect {
    x?:number
    y?:number
    w?:number
    h?:number
}

interface SpriteDataFrame {
    frame:SpriteRect
    rotated:boolean
    trimmed:boolean
    spriteSourceSize:SpriteRect
    sourceSize:SpriteRect
}

interface SpriteMetaData {
    app:string
    version:string
    image?:string
    format?:string
    size:SpriteRect
    scale:number
    smartupdate:string
}

interface SpriteDataJson {
    frames:{[key:string]:SpriteDataFrame}
    meta:SpriteMetaData
}

export class LibGDXSpriteManager extends SpriteManager
{
    public static async createFromAtlas(name:string, capacity:number, scene:Scene, atlasFileUrl:string):Promise<LibGDXSpriteManager> {
        const textContent = await Tools.LoadFileAsync(atlasFileUrl, false);

        return new LibGDXSpriteManager(name, capacity, scene, textContent as string);
    }

    private constructor(name:string, capacity:number, scene:Scene, atlasFileTxt:string){
        console.log('got TXT')
        const lines = atlasFileTxt.split('\n')

        let imageFileName:string|null = null
        let dataJSON:SpriteDataJson = {frames: {}, meta: {
            size:{},
            scale: 1,
            app: 'libgdx packer',
            version: '1.0',
            smartupdate: '???',
        }}
        let nextSprite:string|null = null

        for (let line of lines){
            if (line && !imageFileName) imageFileName = `assets/${line}`

            if (line.substr(0, 2) == '  '){
                if (nextSprite == null) throw new Error('Data field found but no sprite set?')

                if (!dataJSON['frames'][nextSprite]) dataJSON['frames'][nextSprite] = {frame:{}, sourceSize:{}, spriteSourceSize:{}, trimmed: false, rotated: false}

                const parts = line.split(':').map(it => it.trim())

                if (parts[0] == 'xy'){
                    const parts2 = parts[1].split(',').map(it => parseInt(it))
                    dataJSON['frames'][nextSprite]['frame']['x'] = parts2[0]
                    dataJSON['frames'][nextSprite]['frame']['y'] = parts2[1]
                }

                if (parts[0] == 'size'){
                    const parts2 = parts[1].split(',').map(it => parseInt(it))
                    dataJSON['frames'][nextSprite]['frame']['w'] = parts2[0]
                    dataJSON['frames'][nextSprite]['frame']['h'] = parts2[1]
                }

                if (parts[0] == 'orig'){
                    const parts2 = parts[1].split(',').map(it => parseInt(it))
                    dataJSON['frames'][nextSprite]['spriteSourceSize']['x'] = 0
                    dataJSON['frames'][nextSprite]['spriteSourceSize']['y'] = 0
                    dataJSON['frames'][nextSprite]['spriteSourceSize']['w'] = parts2[0]
                    dataJSON['frames'][nextSprite]['spriteSourceSize']['h'] = parts2[1]
                    dataJSON['frames'][nextSprite]['sourceSize']['w'] = parts2[0]
                    dataJSON['frames'][nextSprite]['sourceSize']['h'] = parts2[1]
                }


            } else if (line.indexOf(':') == -1){
                nextSprite = line
            } else if (line.indexOf(':') != -1){
                const parts = line.split(':').map(it => it.trim())

                if (parts[0] == 'size'){
                    const parts2 = parts[1].split(',').map(it => parseInt(it))

                    dataJSON.meta.size.w = parts2[0]
                    dataJSON.meta.size.h = parts2[1]
                }

                if (parts[0] == 'format'){
                    dataJSON.meta.format = parts[1]
                }
            }
        }

        for (let k in dataJSON.frames){
            if (dataJSON.frames[k].frame.x == null) throw new Error(`x on ${k} cannot be null`)
            if (dataJSON.frames[k].frame.y == null) throw new Error(`y on ${k} cannot be null`)
            if (dataJSON.frames[k].frame.w == null) throw new Error(`w on ${k} cannot be null`)
            if (dataJSON.frames[k].frame.h == null) throw new Error(`h on ${k} cannot be null`)

            if (dataJSON.frames[k].spriteSourceSize.x == null) throw new Error(`x on ${k} cannot be null`)
            if (dataJSON.frames[k].spriteSourceSize.y == null) throw new Error(`y on ${k} cannot be null`)
            if (dataJSON.frames[k].spriteSourceSize.w == null) throw new Error(`w on ${k} cannot be null`)
            if (dataJSON.frames[k].spriteSourceSize.h == null) throw new Error(`h on ${k} cannot be null`)

            if (dataJSON.frames[k].sourceSize.w == null) throw new Error(`w on ${k} cannot be null`)
            if (dataJSON.frames[k].sourceSize.h == null) throw new Error(`h on ${k} cannot be null`)
        }

        if (!imageFileName) throw new Error("imageFileName cannot be null")

        console.log(dataJSON)

        super(name, imageFileName, capacity, 64, scene, 0.01, Texture.TRILINEAR_SAMPLINGMODE, true, dataJSON);
    }
}