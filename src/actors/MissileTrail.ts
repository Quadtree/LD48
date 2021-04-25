import {Actor} from "../am/Actor";
import {Scene} from "@babylonjs/core/scene";
import {Color4, ParticleSystem} from "@babylonjs/core";
import {Texture} from "@babylonjs/core/Materials/Textures/texture";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {Missile} from "./Missile";
import {Util} from "../util/Util";

export class MissileTrail extends Actor {
    system:ParticleSystem|null = null;

    timeToLive = 1;

    constructor(private missile:Missile) {
        super();
    }


    enteringView(scene: Scene) {
        super.enteringView(scene);

        console.log("TRAIL!");

        this.system = new ParticleSystem("", 200, scene);

        //if (!Explosion.texture) Explosion.texture =

        this.system.particleTexture = new Texture("assets/solid.png", scene);
        this.system.emitter = this.missile.mesh!.position.clone();
        this.system.minLifeTime = 0.7
        this.system.maxLifeTime = 0.8
        this.system.minSize = 0.4
        this.system.maxSize = 0.5
        this.system.color1 = new Color4(1,.71,0,1);
        this.system.color2 = new Color4(.5,.5,.5,1);
        this.system.colorDead = new Color4(.5,.5,.5,0);
        //this.system.manualEmitCount = 20
        this.system.emitRate = 40

        this.system.direction1 = new Vector3(.2,.2,.2).scale(2)
        this.system.direction2 = this.system.direction1.scale(-1)

        this.system.addVelocityGradient(0, 1)
        this.system.addVelocityGradient(0.1, 1)
        this.system.addVelocityGradient(0.2, .1)
        this.system.addVelocityGradient(1, 0)

        this.system.blendMode = ParticleSystem.BLENDMODE_STANDARD

        this.system.start()
    }

    exitingView() {
        super.exitingView();

        this.system!.dispose();
    }

    update(delta: number) {
        super.update(delta);

        if (this.missile.keep()){
            this.missile.mesh!.rotationQuaternion!.toRotationMatrix(Util.mat);

            (this.system!.emitter as Vector3).copyFrom(this.missile.mesh!.position.add(Vector3.TransformCoordinates(new Vector3(0,0,-2), Util.mat)));
        } else {
            this.system!.emitRate = 0
            this.timeToLive -= delta;
        }
    }

    keep(): boolean {
        return super.keep() && this.timeToLive > 0;
    }
}
