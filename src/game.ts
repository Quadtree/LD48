import { WebGame } from "./multiplayer/WebGame";
import { Game } from './firebase/FirebaseDemo';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import '@babylonjs/loaders/OBJ/index';

window.addEventListener('DOMContentLoaded', async () => {
    // Create the game using the 'renderCanvas'.
    let game = new Game('renderCanvas');

    // Start render loop.
    game.doRender();
});