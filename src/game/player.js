const Phaser = require('phaser/dist/phaser');

/**
 * Describes behavior of the player object.
 * 
 * Should NOT contain code that pertains to other objects or game-global data.
 */
module.exports = class Player {
  /**
   * @param {Phaser.Scene} scene 
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    this.scene = scene;
    
    this.jumpPower = 0;
    this.jumpPowerInc = 10;
    this.jumpPowerMax = 200;
    
    this.sprite = scene.physics.add.sprite(x, y, 'charles');
    this.sprite.body.setBounce(0);

    // @todo: Abstract this out into a set of classes/properties that can be
    //        controlled by the scene or another manager class
    this.cursors = scene.input.keyboard.createCursorKeys();
  }

  update() {
    // @todo: Don't directly use keyboard/cursors for inputs (see note in const.)
    if (this.sprite.body.onFloor()) {
      this.sprite.body.setVelocityX(0);
      if (this.cursors.left.isDown) {
        this.sprite.body.setVelocityX(-100);
      } else if (this.cursors.right.isDown) {
        this.sprite.body.setVelocityX(100);
      }
      if ((this.cursors.space.isDown || this.cursors.up.isDown)) {
        this.jumpPower = Math.min(
          this.jumpPower + this.jumpPowerInc,
          this.jumpPowerMax
        );
      } else {
        this.sprite.body.setVelocityY(-this.jumpPower);
        this.jumpPower = 0;
      }
    }
    if (Math.abs(this.sprite.body.velocity.x) < 1) {
      this.sprite.x = Math.round(this.sprite.x);
    }
    if (Math.abs(this.sprite.body.velocity.y) < 1) {
      this.sprite.y = Math.round(this.sprite.y);
    }
  }
}
