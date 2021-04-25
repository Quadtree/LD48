import {Actor} from "../am/Actor";
import {AdvancedDynamicTexture} from "@babylonjs/gui/2D/advancedDynamicTexture";
import {Scene} from "@babylonjs/core/scene";
import {Rectangle} from "@babylonjs/gui";
import {TextBlock} from "@babylonjs/gui/2D/controls/textBlock";
import {LD48} from "../LD48";
import {HUD} from "./HUD";

export class TitleScreen extends Actor {
    private texture: AdvancedDynamicTexture | null = null;

    background:Rectangle = new Rectangle();
    titleText:TextBlock = new TextBlock();
    titleTextShadow:TextBlock = new TextBlock();

    helpText:TextBlock = new TextBlock();

    authorText:TextBlock = new TextBlock();

    alive = true;

    createDifficultyButton(name:string, y:number, difficulty:number){
        const button = new Rectangle();
        this.texture!.addControl(button);
        button.topInPixels = 100 + y;
        button.widthInPixels = 150;
        button.heightInPixels = 32;
        button.background = "#777777";

        const startCallback = () => {
            LD48.s!.difficulty = difficulty;
            LD48.s!.paused = false;
            this.actorManager!.add(new HUD());
            this.alive = false;

            console.log(`${name} ${difficulty}`);
        };

        button.onPointerDownObservable.add(startCallback);

        const text = new TextBlock();
        this.texture!.addControl(text);
        text.topInPixels = 100 + y;
        text.text = name;
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

        const GAME_NAME = "Cloud 57";

        this.texture.addControl(this.titleTextShadow);
        this.titleTextShadow.fontSize = 120;
        this.titleTextShadow.text = GAME_NAME;
        this.titleTextShadow.topInPixels = -397;
        this.titleTextShadow.leftInPixels = 3;
        this.titleTextShadow.color = "#000000";

        this.texture.addControl(this.titleText);
        this.titleText.fontSize = 120;
        this.titleText.text = GAME_NAME;
        this.titleText.topInPixels = -400;
        this.titleText.color = "#00AACC";

        this.texture.addControl(this.helpText);
        this.helpText.textWrapping = true;
        this.helpText.text = "A science vessel has been lost in a mysterious cloud designated Cloud 57. As they went deeper and deeper into the cloud, they passed through several layers and reported some odd readings. Eventually, we lost contact with them. Go to their last known location and try to find them.\n\n" +
            "Controls:\n" +
            "WAD/Arrow Keys - Move/Strafe\n" +
            "Mouse - Turn\n" +
            "Left Click - Fire cannons\n" +
            "Right Click - Fire missile\n" +
            "R - Restart game\n\n" +
            "Select Difficulty";
        this.helpText.widthInPixels = 500;
        this.helpText.topInPixels = -100;
        this.helpText.color = "#BBBBBB";

        this.texture.addControl(this.authorText);
        const globalViewport = this.texture._getGlobalViewport();
        this.authorText.topInPixels = globalViewport.height / 2 - 40;
        this.authorText.text = "Made by Quadtree for Ludum Dare 48";
        this.authorText.color = "#FFFFFF";

        this.createDifficultyButton("Easy", 0, 0);
        this.createDifficultyButton("Medium", 40, 1);
        this.createDifficultyButton("Hard", 80, 3);
        this.createDifficultyButton("Impossible", 120, 6);

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
