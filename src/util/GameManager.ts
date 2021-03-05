import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Engine } from "@babylonjs/core/Engines/engine";
import { PhysicsViewer } from "@babylonjs/core/Debug/physicsViewer";
import { Scene } from "@babylonjs/core/scene";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import "@babylonjs/core/Physics/physicsEngineComponent";
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import { patchedAmmoJSPlugin } from "./PatchedAmmoJSPlugin";
import { Game } from "./Game";

export class GameManager {
    public readonly canvas: HTMLCanvasElement;
    public readonly engine: Engine;
    public readonly scene: Scene;

    constructor(canvasElement : string, private game:Game) {
        // Create canvas and engine.
        this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this.engine = new Engine(this.canvas, true);

        this.scene = new Scene(this.engine);
    }

    enablePhysics(){
        this.scene.enablePhysics(new Vector3(0, -9.8, 0), patchedAmmoJSPlugin());
    }

    async init(){
        await this.game.init(this);
    }

    setupPhysicsViewer(){
        var physicsViewer = new PhysicsViewer(this.scene);

        const showImposters = (mesh:AbstractMesh) =>{
            for(let cm of mesh.getChildMeshes()){
                showImposters(cm);
            }

            if (mesh.physicsImpostor) {
                console.log(`showing imposters for ${mesh.name}`);
                physicsViewer.showImpostor(mesh.physicsImpostor, mesh as any);
            } else {
                console.log(`NOT showing imposters for ${mesh.name}`);
            }
        }

        this.scene.meshes.forEach(showImposters);
    }

    async start() {
        await this.init();

        // Run the render loop.
        this.engine.runRenderLoop(() => {
            this.scene.render();

            this.game.update(0.016);
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this.engine.resize();
        });


    }
}
