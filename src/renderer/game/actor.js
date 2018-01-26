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
    Object.assign(this, this.defaults);
    this.gameObjects = this.setupGameObjects(scene, x, y);
  }

  /**
   * Shortcut to the first (primary) game object controlled by this actor.
   */
  get gameObject() {
    return this.gameObjects[0];
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
   * @param {Phaser.Scene} scene
   * @param {number} x 
   * @param {number} y 
   * @return {Phaser.GameObject[]}
   */
  setupGameObjects(scene, x, y) {
    throw new Error('setupGameObjects(): Not implemented');
  }

  /**
   * Shortcut to determine whether the object is resting on a solid object below
   */
  get onFloor() {
    return this.gameObject.body.onFloor();
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
