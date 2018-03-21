# Multi-Maker

Inspired by recent "maker" projects such as Mario Maker and Mega Maker, this project continues the trend of specialized game content makers with "MM" abbreviations. No particular franchise is being targeted, but the gameplay style should be similar to Metroid and the like.

Asana: https://app.asana.com/0/523303564324416/list

## How do I get set up?

- Install latest node and npm
- Install Yarn
- `git clone` the repo
- `cd` into repo
- run `yarn`
- run `yarn start`
- Open your web browser to http://localhost:8080
- You will see a blank screen, but wait a moment and everything will load.
- Use the "S", "D" and arrow keys to control the character.
- Notice the slide-out tool bar on the left which appears when you move the mouse pointer to the left edge of the window. It doesn't do anything currently, but this is planned to be the place where users can select the current function of the mouse.

> **NOTE:** Some parts of the UI are using features that are specific to Google Chrome. It will render in Firefox and Microsoft Edge as well, but there may be some graphical glitches.

## Repository Structure

### `./assets/`
Files not bundled into the Webpack bundle but loaded as-is

#### `./assets/editor/`
Assets used by the editor layer, not the game.

#### `./assets/projects/`
Contains base projects from which new projects can be made.

##### `./assets/projects/{project}/`
Each folder in `./assets/projects/` is a base project.

###### `./asssets/projects/{project}/an/`
Animation definitions.

###### `./assets/projects/{project}/bg/`
Images that serve as background in the current project.

###### `./assets/projects/{project}/tm/`
Tiled-compatible .json maps. Currently the tilesets must be embedded because Phaser does not support external tilesets.

###### `./assets/projects/{project}/sp/`
Images that are used as sprite sheets and the .json texture atlases that go with them. The .json atlases must match the name of the sprite image file.

###### `./assets/projects/{project}/so/`
Sound effects.

###### `./assets/projects/{project}/ts/`
Images used as tile sets.

###### `./assets/projects/{project}/mu/`
Music in the form of FastTrackerII XM modules.

###### `./assets/projects/{project}/actor_assets.json`
Maps each actor type to the assets used by that type. Each asset type is organized under a key whose name matches the name of the directory that stores that asset type.

###### `./assets/projects/{project}/actor_properties.json`
Property definitions for each actor type. The definitions include the names, data types, and default values of each property. The JSON file is stored in a format that is compatible with the format used by Tiled's object type editor view.

##### `./assets/projects/antispace/`
The Antispace base project.

#### `./src/`
All JavaScript, HTML, and CSS source code that runs when the application is executed.

###### `./src/main/index.js`
The Electron main entry point. Responsible for creating the main window and a few other low-level things.

##### `./src/renderer/`
Code that is executed in Electron's rendering thread.

###### `./src/renderer/game/`
Code that governs what happens in the game part of the application apart from the editor functionality.

###### `./src/renderer/game/index.js`
This might be described as the entry point for the game, which is loaded by rendering thread at the same time as the editor overlay.

###### `./src/renderer/game/actors/`
Contains the different actor types. All actor types must be exported from the `index.js` in order to be usable from map files.

##### `./src/renderer/index.js`
The entry point for the Electron rendering thread.

##### `./src/renderer/style.css`
Main stylesheet for index.html. At some point this file should probably be split up into smaller components.

###### `./src/renderer/index.html`
Describes the content of the main window.

## Project Structure

### Rooms and Actors
This engine uses a mechanism to organize controller logic based on the idea of "Rooms" and "Actors". This concept runs parallel with Phaser's own concept of "Scenes" and "GameObjects," but is distinct from them.

#### Actors
The purpose of an Actor is to manage one or more Phaser GameObject instances. The responsibility of displaying anything on the screen or performing any kind of physics simulation is left up to Phaser's object types, whereas any other kind of logic is left to the Actor.

Each Actor type is represented by a class that extends the base Actor class.

##### Configurable Properties
Each actor type can have any number of properties whose initial values are provided by project asset data. This data can be found in the file `actor_properties.json` stored in the root of the project assets folder, or in the actor instance definition stored in map files where the actor type is used.

From within controller logic, the current value of each configurable property is stored directly on the Actor instance just like any other property would be. However, the intial values for properties as (loaded from the assets) is stored on the `properties` property.

Note that actors may have properties that are not considered configurable. Class code can use properties the same way whether they are configurable or not, but the non-configurable one can't be set from map data or the `actor_properties.json`.

##### Global Actors
Its possible that an actor may not actually be backed by any specific GameObject. This may happen if the actor pertains to its room as a whole, or if applies to other actors.

#### Rooms
The purpose of a Room is to construct complex in-game content entirely from Tiled map files. Rooms organize Actors and serve as their owner or primary container. However, rooms also track tilemap layers and background images, which usually don't have any actors associated with them. Rooms are said to "own" any content that was loaded with it.

As stated above, rooms are loaded using Tiled map file's JSON data. "Loading" means that the raw data of the Tiled map has been parsed and the appropriate object types have been created and inserted into the Phaser scene. The Tiled files' raw data may be loaded into memory in advance, but the _room_ is not considered loaded until that data has beedn converted to in-game objects.

Multiple rooms can be loaded at the same time. Typically, however, only a few will ever be loaded at once.

When a room is loaded, a spatial offset can be provided to the room's content as a whole. This is because the locations of rooms are not stored in the Tiled map data for the room, but rather, in the "master room" (see below).

##### Room Manager
Rooms are loaded using the **room manager**. The room manager is an instance of the `RoomManager` class and is used throughout the lifecycle of the entire game. It contains a manifest of all actor types, the default property values for each type, and the keys of all assets used by each type. The property values and asset lists are stored in the two JSON files in the root of the project assets folder, `actor_assets.json` and `actor_properties.json`.

##### Master Room
The **master room** is the first room loaded by the game and is used to map out the relationship between the rest of the rooms, plus indicate the location and configuration of a few special objects (such as the player). It is populated primarily with "room boundaries", which are Actors that serve as invisible boundaries of every other room in the game.