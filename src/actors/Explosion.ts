import {Actor} from "../am/Actor";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {ParticleSystem, Scene} from "@babylonjs/core";
import {Color3} from "@babylonjs/core";
import {Texture} from "@babylonjs/core/Materials/Textures/texture";

export class Explosion extends Actor {
    constructor(public pos:Vector3, public size:number, public color:Color3) {
        super();
    }

    system:ParticleSystem|null = null;

    timeToLive = 1 * Math.sqrt(this.size);

    static texture:Texture|null = null;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        console.log(`EXPLOSION at ${this.pos} ${this.size} ${this.color}`)

        this.system = new ParticleSystem("", 20, scene);

        //if (!Explosion.texture) Explosion.texture =

        this.system.particleTexture = new Texture("assets/solid.png", scene);;
        this.system.emitter = this.pos.clone();
        this.system.minLifeTime = 0.1 * Math.sqrt(this.size)
        this.system.maxLifeTime = 0.2 * Math.sqrt(this.size)
        this.system.minSize = 0.15 * this.size
        this.system.maxSize = 0.2 * this.size
        this.system.color1 = this.color.toColor4(1)
        this.system.color2 = this.color.toColor4(1)
        this.system.colorDead = this.color.toColor4(0)
        this.system.manualEmitCount = 20
        this.system.emitRate = 0

        this.system.direction1 = new Vector3(.2,.2,.2).scale(this.size * 8)
        this.system.direction2 = this.system.direction1.scale(-1)

        this.system.addVelocityGradient(0, 1)
        this.system.addVelocityGradient(0.1, 1)
        this.system.addVelocityGradient(0.2, .1)
        this.system.addVelocityGradient(1, 0)
        //this.system.addDragGradient(1, 2)

        this.system.blendMode = ParticleSystem.BLENDMODE_STANDARD

        this.system.start()
    }

    exitingView() {
        super.exitingView();

        this.system!.dispose()
    }

    update(delta: number) {
        super.update(delta);

        this.timeToLive -= delta;
    }

    keep(): boolean {
        return super.keep() && this.timeToLive > 0;
    }
}
