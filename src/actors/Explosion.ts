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

    timeToLive = 1;

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.system = new ParticleSystem("", 200, scene);

        this.system.particleTexture = new Texture("assets/solid.png", scene);
        this.system.emitter = this.pos.clone();
        this.system.minLifeTime = 0.15
        this.system.maxLifeTime = 0.25
        this.system.minSize = 0.02 * this.size
        this.system.maxSize = 0.03 * this.size
        this.system.color1 = this.color.toColor4(1)
        this.system.color2 = this.color.toColor4(1)
        this.system.colorDead = this.color.toColor4(0)
        this.system.manualEmitCount = 200
        this.system.emitRate = 0

        this.system.direction1 = new Vector3(.2,.2,.2).scale(this.size)
        this.system.direction2 = this.system.direction1.scale(-1)

        this.system.addDragGradient(0, .8)
        this.system.addDragGradient(1, .8)

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
