import Phaser from 'phaser';
import GameObjectController from '.';

export default class PlayerBullet extends GameObjectController {
  constructor(scene, x, y, facing) {
    super(scene, x, y);
    this.scene.groups.bullet.add(this);
    this.scene.sound.play('pew');
    this.facing = facing;
    this.vx = facing ? this.maxSpeed : -this.maxSpeed;
  }
  get defaultConfig() {
    return {
      maxSpeed: 920,
      tailLength: 7,
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
    const all = {};
    for (let i = 0; i < this.tailLength; i++) {
      all[`tail${i}`] = ['laserTail'];
    }
    all.main = ['laserHead'];
    return all;
  }
  setupGameObjects(x, y) {
    const all = {};
    all.main = this.scene.physics.add.sprite(x, y, 'laser');
    all.main.setDisplayOrigin(this.originX, this.originY);
    all.main.body.width = this.bodyW;
    all.main.body.height = this.bodyH;
    all.main.body.allowGravity = false;
    all.main.play('laserHead');
    return all;
  }
  resetTailParticle() {

  }
}
