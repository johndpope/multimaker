import _ from 'lodash';
import Phaser from 'phaser';

export default class Actor {
  /**
   * @prop {Phaser.GameObject} gameObject Game object responsible for displaying the player and containing physics body
   */

  /**
   * @param {Phaser.Scene} scene 
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;
    Object.assign(this, this.defaults);
    this.gameObjects = this.setupGameObjects(x, y);
    this.setupAnimations();
  }

  /**
   * Shortcut to the first (primary) game object controlled by this actor.
   */
  get gameObject() {
    return this.gameObjects.main;
  }

  /**
   * Rreturns the object's simple default values
   * 
   * These are values that can be configured later.
   * 
   * @return {{[key: string]: any}}
   */
  get defaults() {
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

  /**
   * Shortcut to determine whether the object is resting on a solid object below
   */
  get onFloor() {
    return this.gameObject.body.onFloor();
  }

  get x() {
    return this.gameObject.x;
  }
  set x(x) {
    this.gameObject.x = x;
  }
  get y() {
    return this.gameObject.y;
  }
  set y(y) {
    this.gameObject.y;
  }

  /**
   * Shortcut to horizontal velocity
   */
  get vx() {
    return this.gameObject.body.velocity.x;
  }
  set vx(vx) {
    this.gameObject.setVelocityX(vx);
  }

  /**
   * Shortcut to vertical velocity
   */
  get vy() {
    return this.gameObject.body.velocity.y;
  }
  set vy(vy) {
    this.gameObject.setVelocityY(vy);
  }
}
