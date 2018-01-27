import _ from 'lodash';
import Phaser from 'phaser';

/**
 * @typedef {(string|number|boolean|string[]|number[]|boolean[])} ConfigValue
 */

/**
 * Controls Phaser GameObjects, but is not a GameObject itself and does not directly appear inside of any scenes.
 */
export default class GameObjectController {
  /**
   * @param {Phaser.Scene} scene Scene from which this GOC is being created
   * @param {number} x Initial X position of the main GameObject for this GOC
   * @param {number} y Initial Y position of the main GameObject for this GOC
   */
  constructor(scene, x, y) {
    this.scene = scene;
    Object.assign(this, this.defaultConfig);
    this.gameObjects = this.setupGameObjects(x, y);
    this.setupAnimations();
  }

  /**
   * Shortcut to the first (primary) game object controlled by this GOC.
   */
  get main() {
    return this.gameObjects.main;
  }

  /**
   * Rreturns the object's default configuration
   * 
   * @return {{[key: string]: ConfigValue}}
   */
  get defaultConfig() {
    return {};
  }

  /**
   * Map of arrays of animations for each game object
   * @return {{[key: string]: string[]}}
   */
  get animationNames() {
    return {};
  }

  /**
   * Return a mapping of all game objects this controller wants added to its current scene.
   * 
   * These objects will also be removed when this controller is destroyed.
   * 
   * The key 'main' is used to refer to the primary game object, which has
   * special significance to the scene.
   * 
   * @param {number} x 
   * @param {number} y 
   * @return {{ [key: string]: Phaser.GameObject }}
   */
  setupGameObjects(x, y) {
    throw new Error('setupGameObjects(): Not implemented');
  }

  setupAnimations() {
    const { animationNames } = this;
    _.each(this.gameObjects, ({ anims }, spriteKey) => {
      const spriteAnimationNames = animationNames[spriteKey];
      if (!(spriteAnimationNames && anims)) {
        return;
      }
      spriteAnimationNames.forEach(spriteAnimationName => {
        anims.load(spriteAnimationName);
      })
    });
  }
}
