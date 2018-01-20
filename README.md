# Multi-Maker

Inspired by recent "maker" projects such as Mario Maker and Mega Maker, this project continues the trend of specialized game content makers with "MM" abbreviations. No particular IP is being targeted, but the gameplay style should be similar to Metroid and the like.

Asana: https://app.asana.com/0/523303564324416/list

## How do I get set up?

This is an Electron app and as such it does not need to use any bundler or file watching.

To run:

- Install latest node 8.x and npm
- `git clone` the repo
- `cd` into repo
- run `npm i`
- run `npm start`

## Repository Structure

### `./projects/`
Contains base projects from which new projects can be made.

#### `./projects/{project}/`
Each folder in `./projects/` is a base project.

##### `./projects/{project}/backgrounds/`
Images that serve as background in the current project.

##### `./projects/{project}/maps/`
Tiled-compatible .json maps. Currently the tilesets must be embedded because Phaser does not support external tilesets.

##### `./projects/{project}/sprites/`
Images that are used as sprite sheets and the .json texture atlases that go with them. The .json atlases must match the name of the sprite image file.

##### `./projects/{project}/tiles/`
Images used as tile sets.

#### `./projects/antispace/`
The Antispace base project.

### `./src/`
All JavaScript, HTML, and CSS source code that runs when the application is executed.

#### `./src/game/`
Code that governs what happens in the game part of the application apart from the editor functionality.

#### `./src/game/index.js`
This might be described as the entry point for the game, which is loaded by `renderer.js` at the same time as the editor overlay.

#### `./src/main.js`
The program main entry point. Responsible for creating the main window and a few other low-level things.

#### `./src/renderer.js`
The "client-side" entry point that Electron runs within the main window.

#### `./src/index.html`
Describes the content of the main window and is where `renderer.js` is executed.

#### `./src/style.css`
Main stylesheet for index.html. At some point this file should probably be split up into smaller components.

## Development Guidelines

### Object Controller Classes
Phaser doesn't seem to have any base class for game-specific object types. It's collection of "Game Object" classes are more like view primitives which are meant to be used indirectly by other objects. That means it is, apparently, up to the developer to come up with a scheme for organizing such logic. To me, this feels counterintuitive for a game engine. But I can see the advantages.