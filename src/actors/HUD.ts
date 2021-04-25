import {Actor} from "../am/Actor";
import {AdvancedDynamicTexture} from "@babylonjs/gui/2D/advancedDynamicTexture";
import {Scene} from "@babylonjs/core/scene";
import {Trackable} from "./Trackable";
import {TextBlock} from "@babylonjs/gui/2D/controls/textBlock";
import {Vector3} from "@babylonjs/core/Maths/math.vector";
import {Util} from "../util/Util";
import {Control, Rectangle} from "@babylonjs/gui";

class TrackingLabel {
    public active:boolean = true;
    public label:TextBlock;
    public rectangle:Rectangle;

    constructor(private scene:Scene, private tex:AdvancedDynamicTexture, private trackable:Trackable) {
        this.label = new TextBlock("TEST");
        tex.addControl(this.label);
        this.label.color = this.trackable.getColor().toHexString(true);

        this.rectangle = new Rectangle();
        tex.addControl(this.rectangle);
        this.rectangle.color = this.trackable.getColor().toHexString(true);
        this.rectangle.width = "32px";
        this.rectangle.height = "32px";

        //this.rectangle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        //this.rectangle.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    }

    update(){
        if (this.label.text != this.trackable.getText()) {
            this.label.text = this.trackable.getText();
        }

        const mesh = this.trackable.getMesh();
        const globalViewport = this.tex._getGlobalViewport();

        let position = mesh.getBoundingInfo ? mesh.getBoundingInfo().boundingSphere.center : (Vector3.ZeroReadOnly as Vector3);
        let projectedPosition = Vector3.Project(position, mesh.getWorldMatrix(), this.scene.getTransformMatrix(), globalViewport);

        projectedPosition.x = Math.min(Math.max(projectedPosition.x, 120), globalViewport.width - 120);
        projectedPosition.y = Math.min(Math.max(projectedPosition.y, 120), globalViewport.height - 120);

        if (projectedPosition.z < 0 || projectedPosition.z > 1) {

        }

        HUD.debugData!.text = `${projectedPosition}`;

        this.label._moveToProjectedPosition(projectedPosition.add(new Vector3(0, -30, 0)));
        this.rectangle._moveToProjectedPosition(projectedPosition.add(new Vector3(-globalViewport.width / 2 + 16, -globalViewport.height / 2 + 16, 0)));

        //this.rectangle.left = "20px";
        //this.rectangle.top = "20px";
    }

    destroy(){
        this.tex.removeControl(this.label);
        this.tex.removeControl(this.rectangle);
    }
}

export class HUD extends Actor {
    private texture:AdvancedDynamicTexture|null = null;

    private trackingLabels:{[key:string]:TrackingLabel} = {};

    public static debugData:TextBlock|null = null;

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

        console.log("UI created");
    }

    update(delta: number) {
        super.update(delta);

        for (const k in this.trackingLabels){
            this.trackingLabels[k].active = false;
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
                this.trackingLabels[k].update();
            }
        }
    }
}
