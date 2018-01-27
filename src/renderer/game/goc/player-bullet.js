import Phaser from 'phaser';
import GameObjectController from '.';

export default class PlayerBullet extends GameObjectController {
  constructor(scene, x, y, facing) {
    super(scene, x, y);
    this.scene.groups.bullet.add(this);
    this.scene.sound.play('pew');
    this.facing = facing;
    this.main.setVelocityX(facing ? this.maxSpeed : -this.maxSpeed);
  }
  get defaultConfig() {
    return {
      maxSpeed: 920,
      ttl: 60,
      bodyW: 24,
      bodyH: 1,
      originX: 0.5,
      originY: 0.5
    };
  }
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x 
   * @param {number} y 
   * @return {{[key: string]: Phaser.GameObject}}
   */
  get animationNames() {
    return { main: ['laserHead'] };
  }
  setupGameObjects(x, y) {
    const main = this.scene.physics.add.sprite(x, y, 'laser');
    main.setDisplayOrigin(this.originX, this.originY);
    main.body.width = this.bodyW;
    main.body.height = this.bodyH;
    main.body.allowGravity = false;
    main.play('laserHead');
    return { main };
  }
  resetTailParticle() {

  }
}
