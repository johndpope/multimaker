# Multi-Maker

Inspired by recent "maker" projects such as Mario Maker and Mega Maker, this project continues the trend of specialized game content makers with "MM" abbreviations. No particular IP is being targeted, but the gameplay style should be similar to Metroid and the like.

Asana: https://app.asana.com/0/523303564324416/list

## How do I get set up?

This app is based on Electron, but it uses Webpack for development.

To run:

- Install latest node 8.x and npm
- Install Yarn
- `git clone` the repo
- `cd` into repo
- run `yarn`
- run `yarn dev`

## Repository Structure

### `./static/`
Files not bundled into the Webpack bundle but loaded as-is

#### `./static/projects/`
Contains base projects from which new projects can be made.

##### `./static/projects/{project}/`
Each folder in `./static/projects/` is a base project.

###### `./static/projects/{project}/backgrounds/`
Images that serve as background in the current project.

###### `./static/projects/{project}/maps/`
Tiled-compatible .json maps. Currently the tilesets must be embedded because Phaser does not support external tilesets.

##### `./static/projects/{project}/sprites/`
Images that are used as sprite sheets and the .json texture atlases that go with them. The .json atlases must match the name of the sprite image file.

###### `./static/projects/{project}/tiles/`
Images used as tile sets.

##### `./projects/antispace/`
The Antispace base project.

#### `./src/`
All JavaScript, HTML, and CSS source code that runs when the application is executed.

##### `./src/main`
Code that is executed in the main Electron thread.

###### `./src/main/index.html`
Describes the content of the main window in production builds.

###### `./src/main/index.js`
The Electron main entry point. Responsible for creating the main window and a few other low-level things.

##### `./src/renderer/`
Code that is executed in Electron's rendering thread.

###### `./src/renderer/game/`
Code that governs what happens in the game part of the application apart from the editor functionality.

###### `./src/renderer/game/index.js`
This might be described as the entry point for the game, which is loaded by rendering thread at the same time as the editor overlay.

##### `./src/renderer/index.js`
The entry point for the Electron rendering thread.

##### `./src/renderer/style.css`
Main stylesheet for index.html. At some point this file should probably be split up into smaller components.

## Development Guidelines

### Object Controller Classes
Phaser doesn't seem to have any base class for game-specific object types. It's collection of "Game Object" classes are more like view primitives which are meant to be used indirectly by other objects. That means it is, apparently, up to the developer to come up with a scheme for organizing such logic. To me, this feels counterintuitive for a game engine. But I can see the advantages.