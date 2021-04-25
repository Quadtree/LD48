import {Actor} from "../am/Actor";
import {AdvancedDynamicTexture} from "@babylonjs/gui/2D/advancedDynamicTexture";
import {Scene} from "@babylonjs/core/scene";
import {Rectangle} from "@babylonjs/gui";
import {TextBlock} from "@babylonjs/gui/2D/controls/textBlock";
import {LD48} from "../LD48";
import {HUD} from "./HUD";

export class VictoryScreen extends Actor {
    private texture: AdvancedDynamicTexture | null = null;

    background:Rectangle = new Rectangle();
    titleText:TextBlock = new TextBlock();
    titleTextShadow:TextBlock = new TextBlock();

    helpText:TextBlock = new TextBlock();

    authorText:TextBlock = new TextBlock();

    alive = true;

    createDifficultyButton(){
        const button = new Rectangle();
        this.texture!.addControl(button);
        button.topInPixels = 100;
        button.widthInPixels = 150;
        button.heightInPixels = 32;
        button.background = "#777777";

        const startCallback = () => {
            LD48.s!.restart();
        };

        button.onPointerDownObservable.add(startCallback);

        const text = new TextBlock();
        this.texture!.addControl(text);
        text.topInPixels = 100;
        text.text = "Play Again";
        text.color = "#FFFFFF";
        text.widthInPixels = 150;
        text.heightInPixels = 32;
        text.onPointerDownObservable.add(startCallback);
    }

    enteringView(scene: Scene) {
        super.enteringView(scene);

        this.texture = AdvancedDynamicTexture.CreateFullscreenUI("MainUI");

        this.texture.addControl(this.background);
        this.background.background = "#222222";
        this.background.color = "#222222";
        this.background.alpha = 0.7;

        this.texture.addControl(this.titleTextShadow);
        this.titleTextShadow.fontSize = 120;
        this.titleTextShadow.text = "Victory!";
        this.titleTextShadow.topInPixels = -297;
        this.titleTextShadow.leftInPixels = 3;
        this.titleTextShadow.color = "#000000";

        this.texture.addControl(this.titleText);
        this.titleText.fontSize = 120;
        this.titleText.text = "Victory!";
        this.titleText.topInPixels = -300;
        this.titleText.color = "#00AACC";

        this.texture.addControl(this.helpText);
        this.helpText.textWrapping = true;
        this.helpText.text = "You found the science vessel and were able to give it the spare parts it needed to escape! Well done!";
        this.helpText.widthInPixels = 500;
        this.helpText.topInPixels = -100;
        this.helpText.color = "#BBBBBB";

        this.createDifficultyButton();

        LD48.s!.paused = true;
    }

    exitingView() {
        super.exitingView();

        this.texture!.dispose();
    }

    keep(): boolean {
        return super.keep() && this.alive;
    }
}
