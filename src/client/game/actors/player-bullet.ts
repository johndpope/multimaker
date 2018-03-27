import Actor from '../actor';

export default class PlayerBullet extends Actor {
  facing: number;
  originX: number;
  originY: number;
  bodyW: number;
  bodyH: number;
  speed: number;

  get defaultConfig() {
    return {
      groups: ['bullet'],
      animations: {
        main: ['player_bullet_head']
      }
    };
  }
  
  setupFinal() {
    this.gameObjects.main.setVelocityX(this.facing ? this.speed : -this.speed);
    this.room.manager.scene.sound.play('player_bullet');
  }
  
  setupGameObjects({x = 0, y = 0}) {
    const main = this.room.manager.scene.physics.add.sprite(x, y, 'player_bullet');
    main.setDisplayOrigin(this.originX, this.originY);
    main.body.width = this.bodyW;
    main.body.height = this.bodyH;
    main.body.allowGravity = false;
    main.play('player_bullet_head');
    return { main };
  }

  resetTailParticle() {

  }
}
