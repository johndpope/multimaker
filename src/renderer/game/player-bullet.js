import Phaser from 'phaser';
import Actor from './actor';

export default class PlayerBullet extends Actor {
  constructor(scene, x, y, facing) {
    super(scene, x, y);
    this.scene.groups.bullet.add(this);
    this.scene.sound.play('pew');
    this.facing = facing;
    this.vx = facing ? this.maxSpeed : -this.maxSpeed;
  }
  get defaults() {
    return {
      maxSpeed: 920,
      tailLength: 7,
      ttl: 60
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
    all.main.setDisplayOrigin(0.5, 0.5);
    all.main.body.width = 24;
    all.main.body.height = 1;
    all.main.body.allowGravity = false;
    all.main.play('laserHead');
    return all;
  }
  resettailParticle() {

  }
}
