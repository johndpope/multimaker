const Phaser = require('phaser/dist/phaser');

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
    this.cursors = scene.input.keyboard.createCursorKeys();
  }

  update() {
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
