import _ from 'lodash';
import Phaser from 'phaser';

/**
 * @typedef {{[key: string]: GOCManifestEntry}} GOCManifest
 */

/**
 * @typedef {Object} GOCManifestEntry
 * @prop {GOCClass} class GOC class/constructor
 * @prop {GOCManifestAssetMap} assets Asset map associated with class
 * @prop {GOCManifestPropertyMap} properties Default properties
 */

/**
 * @typedef {{[key: string]: (GOCClass} GOCManifestClassMap
 */

/**
 * @typedef {new(scene: Scene, x: number, y: number) => GameObjectController} GOCClass
 */

/**
 * @typedef {{[key: string]: GOCManifestAssetMap}} GOCManifestClassAssetMap
 */

/**
 * @typedef {Object} GOCManifestAssetMap
 * @prop {string[]} an Animations
 * @prop {string[]} so Sounds
 * @prop {string[]} sp Sprites (atlas + image)
 */

/**
 * @typedef {{[key: string]: (string|number|boolean)}} GOCManifestPropertyMap
 */

/**
 * @typedef {Object} GOCManifestPropertyListEntry
 * @prop {string} name
 * @prop {GOCManifestPropertyDef[]} properties
 */

/**
 * @typedef {Object} GOCManifestPropertyDef
 * @prop {string} name
 * @prop {GOCManifestPropertyDefType} type
 * @prop {string} value
 */

/**
 * @typedef {("string"|"number"|"boolean")} GOCManifestPropertyDefType
 */

/**
 * A group that can load and create content in the scene from a tilemap key.
 */
export default class Room extends Phaser.GameObjects.Group {
  /**
   * @param {Phaser.Scene} scene Scene that this group belongs to
   * @param {GOCManifest} manifest Game Object Controller manifest
   * @param {string} tilemapKey Key of a tilemap
   */
  constructor(scene, manifest, tilemapKey) {
    super(scene);
    this.manifest = manifest
    this.tilemapKey = tilemapKey
  }
  /**
   * Load the tilemap data and all referenced assets asynchronously.
   * 
   * Does NOT add the content to the scene. Returned promise resolves after all
   * referenced assets are loaded.
   * 
   * @return {Promise<null>}
   */
  async preload() {
    // TODO
  }
  /**
   * Construct game object contollers from the manifest and loaded tilemap data.
   * 
   * The constructed game objects will be immediately added to the scene.
   */
  load() {
    // TODO
  }

  /**
   * Create a Game Object Controller manifest from constituent parts.
   * 
   * @param {GOCManifestClassMap} classes
   * @param {GOCManifestClassAssetMap} assets
   * @param {GOCManifestPropertyListEntry[]} propertyList
   * @return {GOCManifest} New manifest
   */
  static createManifest(classes, assets, propertyList) {
    const propertyDefs =
      _.transform(propertyList, (m, { name, properties }) => {
        m[name] = properties;
      }, {});
    return _.transform(classes, (m, Class, key) => {
      m[key] = {
        class: Class,
        assets: assets[key],
        properties:
          _.transform(propertyDefs[key], (m, { name, type, value }) => {
            m[name] =
              (type === 'string') ? `${value}` :
              (type === 'int') ? parseInt(value) :
              (type === 'float') ? parseFloat(value) :
              (type === 'bool') ? !!value :
              null;
          }, {})
      };
    }, {});
  }
}
