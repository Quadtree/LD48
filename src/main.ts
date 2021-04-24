import { WebGame } from "./multiplayer/WebGame";
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import '@babylonjs/loaders/OBJ/index';
import {TerrainDemo} from "./TerrainDemo";
import { GameManager } from "./util/GameManager";
import {LD48} from "./LD48";

window.addEventListener('DOMContentLoaded', async () => {
    new GameManager('renderCanvas', new LD48()).start();
});
