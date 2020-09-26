This is the BabylonJS branch.

## Dev Server
`docker-compose up serve`

## Dev Server with Texture Packer
`docker-compose up serve texture-packer`

## Prod Build
`docker-compose run build`

# Troubleshooting
- Sometimes yarn freezes: If this happens, restart Docker and try again.
- VSCode doesn't find TypeScript dependencies: Open the module file in the editor. Then Press Ctrl+Shift+P, "Restart TS Server".

# Other Notes
* The universal camera is not cutting it for FPS purposes. It falls through things and slides on surfaces. Time to try some other stuff.
* The babylonjs-charactercontroller is extremely primitive. It doesn't even stick to the ground when climbing down slopes
