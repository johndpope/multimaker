import path from 'path';
import _ from 'lodash';
const Phaser = require('phaser');
import FSXHR from '../fs-xml-http-request';
import Player from './player';

// Modify the loader so it will load local files instead of remote files
// FIXME: This is a dirty hack that will probably break
FSXHR.install(Phaser.Loader.LoaderPlugin.prototype, 'processLoadQueue');

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
    init() {
      // DEBUG: Expose scene globally
      window.scene = this;
    }
    preload() {
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

      const AS_SN = path.join(AS, 'sounds');
      this.load.audio('chink', path.join(AS_SN, 'chink.wav'));
      this.load.audio('crunch', path.join(AS_SN, 'crunch.wav'));
      this.load.audio('footstep', path.join(AS_SN, 'footstep.wav'));
      this.load.audio('jump', path.join(AS_SN, 'jump.wav'));
      this.load.audio('land', path.join(AS_SN, 'land.wav'));
      this.load.audio('pew', path.join(AS_SN, 'pew.wav'));
    }
    create() {
      this
        .setupFrameSounds()
        .setupGroups()
        .setupMaps()
        .setupPlayer()
        .setupCollisions()
        .setupCamera()
        .setupInputs();
    }
    
    setupFrameSounds() {
      _.each(this.anims.anims.entries, (anim, key) => {
        anim.onUpdate = sprite => {
          const { sound } = sprite.anims.currentFrame.frame.customData;
          if (sound) {
            this.sound.play(sound);
          }
        }
      })
      return this;
    }
    
    setupGroups() {
      this.groups = {
        player: this.add.group(),
        bullet: this.add.group()
      };
      return this;
    }

    setupMaps() {
      this.tm = this.add.tilemap('room000');
      this.ts = this.tm.addTilesetImage('tileset00');
      this.layer = this.tm.createStaticLayer(0, this.ts, 0, 0);
      this.layer.setCollisionBetween(64, 128);
      return this;
    }
    
    setupPlayer() {
      this.player = new Player(this, 100, 50);
      this.groups.player.add(this.player.gameObject);
      return this;
    }
    
    setupCollisions() {
      this.physics.add.collider(this.player.gameObject, this.layer);
      return this;
    }

    setupCamera() {
      this.cameras.main.setRoundPixels(true);
      this.cameras.main.setBounds(0, 0, this.tm.widthInPixels, this.tm.heightInPixels);
      this.cameras.main.startFollow(this.player.gameObject);
      return this;
    }

    setupInputs() {
      this.cursors = this.input.keyboard.createCursorKeys();
      return this;
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
