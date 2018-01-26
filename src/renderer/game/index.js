import path from 'path';
import Phaser from 'phaser';
import FSXHR from '../fs-xml-http-request';
import Player from './player';

FSXHR.install();
const game = new Phaser.Game({
  type: Phaser.WEBGL,
  width: 400,
  height: 225,
  pixelArt: true,
  physics: {
    // @todo: Switch to 'matter' so we can use sloped tiles
    default: 'arcade',
    arcade: {
      // debug: true,
      gravity: {
        y: 450
      }
    }
  },
  
  scene: new class extends Phaser.Scene {
    preload() {
      window.scene = this;
      
      const AS = path.join(__static, 'projects', 'antispace');

      const AS_SP = path.join(AS, 'sprites');
      this.load.atlas(
        'charles',
        path.join(AS_SP, 'charles.png'),
        path.join(AS_SP, 'charles.json')
      );
      
      const AS_AN = path.join(AS, 'animations');
      this.load.animation('charlesAnim', path.join(AS_AN, 'charles.json'));
      
      const AS_TS = path.join(AS, 'tiles');
      this.load.image('tileset00', path.join(AS_TS, 'tsNAZ.png'));
      
      const AS_M = path.join(AS, 'maps');
      this.load.tilemapTiledJSON('room000', path.join(AS_M, 'room000.json'));
    }
    create() {
      this.cursors = this.input.keyboard.createCursorKeys();
      
      this.groups = {
        player: this.add.group(),
        bullet: this.add.group()
      };

      this.player = new Player(this, 100, 50);
      this.groups.player.add(this.player.gameObject);
      
      this.tm = this.add.tilemap('room000');
      this.ts = this.tm.addTilesetImage('tileset00');
      this.layer = this.tm.createStaticLayer(0, this.ts, 0, 0);
      this.layer.setCollisionBetween(64,128);
      
      this.physics.add.collider(this.player.gameObject, this.layer);
      this.setupCamera();
    }
    
    setupCamera() {
      this.cameras.main.setRoundPixels(true);
      this.cameras.main.setBounds(0, 0, this.tm.widthInPixels, this.tm.heightInPixels);
      this.cameras.main.startFollow(this.player.gameObject);
    }

    update() {
      this.player.update(this.getInputs());
    }

    getInputs() {
      const { cursors: {
        left: { isDown: left },
        right: { isDown: right },
        up: { isDown: up },
        down: { isDown: down },
        space: { isDown: jump }
      } } = this;
      return {
        left: left && !right,
        right: right && !left,
        up: up && !down,
        down: down && !up,
        jump
      };
    }
  }
});
