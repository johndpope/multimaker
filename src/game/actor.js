const Phaser = require('phaser/dist/phaser');

module.exports = class Actor {
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
    this.gameObject = this.setupGameObject(scene, x, y);
    this.setupComplete();
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
   * @return {Phaser.GameObject}
   */
  setupGameObject(scene, x, y) {
    throw new Error('setupGameObject(): Not implemented');
  }

  setupComplete() { }

  get onFloor() {
    return this.gameObject.body.onFloor();
  }

  get vx() {
    return this.gameObject.body.velocity.x;
  }

  set vx(vx) {
    this.gameObject.setVelocityX(vx);
  }

  get vy() {
    return this.gameObject.body.velocity.y;
  }

  set vy(vy) {
    this.gameObject.setVelocityY(vy);
  }
}