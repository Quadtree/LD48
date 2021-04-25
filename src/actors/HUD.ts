import {Actor} from "../am/Actor";
import {AdvancedDynamicTexture} from "@babylonjs/gui/2D/advancedDynamicTexture";
import {Scene} from "@babylonjs/core/scene";
import {Trackable} from "./Trackable";
import {TextBlock} from "@babylonjs/gui/2D/controls/textBlock";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {Util} from "../util/Util";
import {Control, Image, Rectangle} from "@babylonjs/gui";
import {PlayerShip} from "./PlayerShip";

class TrackingLabel {
    public active:boolean = true;
    public label:TextBlock;
    public distanceLabel:TextBlock;
    public rectangle:Rectangle;

    constructor(private scene:Scene, private tex:AdvancedDynamicTexture, private trackable:Trackable) {
        this.label = new TextBlock("TEST");
        tex.addControl(this.label);
        this.label.color = this.trackable.getColor().toHexString(true);

        this.distanceLabel = new TextBlock("DIST");
        tex.addControl(this.distanceLabel);
        this.distanceLabel.color = this.trackable.getColor().toHexString(true);

        this.rectangle = new Rectangle();
        tex.addControl(this.rectangle);
        this.rectangle.color = this.trackable.getColor().toHexString(true);
        this.rectangle.width = "32px";
        this.rectangle.height = "32px";

        //this.rectangle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        //this.rectangle.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    }

    private validProjectedPosition:Vector3 = new Vector3();

    update(playerShipPos:Vector3|null){
        if (this.label.text != this.trackable.getText()) {
            this.label.text = this.trackable.getText();
        }



        const mesh = this.trackable.getMesh();
        const globalViewport = this.tex._getGlobalViewport();

        let position = mesh.getBoundingInfo ? mesh.getBoundingInfo().boundingSphere.center : (Vector3.ZeroReadOnly as Vector3);
        let projectedPosition = Vector3.Project(position, mesh.getWorldMatrix(), this.scene.getTransformMatrix(), globalViewport);

        if ((projectedPosition.z < 0 || projectedPosition.z > 1)){ //&&
            //projectedPosition.x > 120 && projectedPosition.x < globalViewport.width - 120 &&
            //projectedPosition.y > 120 && projectedPosition.y < globalViewport.height - 120) {
            projectedPosition = this.validProjectedPosition.clone();
        } else {
            this.validProjectedPosition = projectedPosition.clone();
        }

        projectedPosition.x = Math.min(Math.max(projectedPosition.x, 120), globalViewport.width - 120);
        projectedPosition.y = Math.min(Math.max(projectedPosition.y, 120), globalViewport.height - 120);



        //HUD.debugData!.text = `${projectedPosition}`;

        if (playerShipPos) {
            this.distanceLabel.text = `${Math.round(playerShipPos.subtract(mesh.position).length())}`;
        } else {
            this.distanceLabel.text = `???`;
        }

        this.label._moveToProjectedPosition(projectedPosition.add(new Vector3(0, -30, 0)));
        this.distanceLabel._moveToProjectedPosition(projectedPosition.add(new Vector3(0, 30, 0)));
        this.rectangle._moveToProjectedPosition(projectedPosition.add(new Vector3(-globalViewport.width / 2 + 16, -globalViewport.height / 2 + 16, 0)));

        //this.rectangle.left = "20px";
        //this.rectangle.top = "20px";
    }

    destroy(){
        this.tex.removeControl(this.label);
        this.tex.removeControl(this.rectangle);
        this.tex.removeControl(this.distanceLabel);
    }
}

class StatusBar {
    constructor(private tex:AdvancedDynamicTexture, private graphic:string, private src:() => number, private y:number) {
    }

    private elements:Image[] = [];

    update(){
        const val = this.src();

        while (val > this.elements.length){
            let nextShieldPos = this.elements.length * 40;

            const globalViewport = this.tex._getGlobalViewport();

            const nElement = new Image("", this.graphic);
            nElement.topInPixels = globalViewport.height / 2 - 40 + this.y;
            nElement.leftInPixels = -globalViewport.width / 2 + 40 + nextShieldPos;
            nElement.widthInPixels = 32;
            nElement.heightInPixels = 32;

            this.tex.addControl(nElement);
            this.elements.push(nElement);
        }

        if (this.elements.length > val){
            this.tex.removeControl(this.elements.pop()!);
        }
    }
}

export class HUD extends Actor {
    private texture:AdvancedDynamicTexture|null = null;

    private trackingLabels:{[key:string]:TrackingLabel} = {};

    public statusLabel:TextBlock|null = null;

    public static debugData:TextBlock|null = null;

    private armorBar:StatusBar|null = null;
    private missileBar:StatusBar|null = null;

    private radiationDamageLabel = new TextBlock();

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.texture = AdvancedDynamicTexture.CreateFullscreenUI("MainUI");

        HUD.debugData = new TextBlock("DEBUG");
        if (Util.CHEATS_ENABLED) {
            HUD.debugData.color = "#ffffff";
            HUD.debugData.left = -600;
            HUD.debugData.top = -600;
            HUD.debugData.text = "DEBUG DATA";
            this.texture.addControl(HUD.debugData);
        }

        const globalViewport = this.texture._getGlobalViewport();

        this.statusLabel = new TextBlock("");
        this.statusLabel.color = "white";
        this.statusLabel.leftInPixels = -globalViewport.width / 2 + 80;
        this.statusLabel.topInPixels = globalViewport.height / 2 - 40;
        this.statusLabel.text = "TEXT";
        this.statusLabel.isVisible = false;

        this.texture.addControl(this.statusLabel);

        this.armorBar = new StatusBar(this.texture, "assets/shield.png", () => {
            const playerShips = this.actorManager!.actors.filter(it => it instanceof PlayerShip);

            if (playerShips.length > 0) {
                const playerShip = playerShips[0] as PlayerShip;

                return playerShip.hp;
            }

            return 0;
        }, 0);

        this.missileBar = new StatusBar(this.texture, "assets/missile.png", () => {
            const playerShips = this.actorManager!.actors.filter(it => it instanceof PlayerShip);

            if (playerShips.length > 0) {
                const playerShip = playerShips[0] as PlayerShip;

                return playerShip.missiles;
            }

            return 0;
        }, -45);

        this.texture.addControl(this.radiationDamageLabel);
        this.radiationDamageLabel.leftInPixels = -globalViewport.width / 2 + 165;
        this.radiationDamageLabel.topInPixels = globalViewport.height / 2 - 125;
        this.radiationDamageLabel.color = "red";
        this.radiationDamageLabel.text = "WARNING: RADIATION DAMAGE";


        console.log("UI created");
    }

    update(delta: number) {
        super.update(delta);

        for (const k in this.trackingLabels){
            this.trackingLabels[k].active = false;
        }

        const playerShips = this.actorManager!.actors.filter(it => it instanceof PlayerShip);

        let playerShipPos = null;

        if (playerShips.length > 0) {
            const playerShip = playerShips[0] as PlayerShip;

            playerShipPos = playerShip.model!.position;

            this.statusLabel!.text = `HP: ${Math.round(playerShip.hp)} Missiles: ${playerShip.missiles}`;

            this.radiationDamageLabel.isVisible = playerShip.radiationDamage;
        } else {
            this.radiationDamageLabel.isVisible = false;
        }

        for (const a of this.actorManager!.actors){
            if (a.keep() && (a as any).isActivelyTrackable && (a as any).isActivelyTrackable()) {
                if (typeof this.trackingLabels[a.netID] === "undefined") {
                    this.trackingLabels[a.netID] = new TrackingLabel(this.actorManager!.scene!, this.texture!, a as unknown as Trackable);
                }
                this.trackingLabels[a.netID].active = true;
            }
        }

        for (const k of Object.keys(this.trackingLabels)){
            if (!this.trackingLabels[k].active){
                this.trackingLabels[k].destroy();
                delete this.trackingLabels[k];
            } else {
                this.trackingLabels[k].update(playerShipPos);
            }
        }

        this.armorBar!.update();
        this.missileBar!.update();
    }
}
