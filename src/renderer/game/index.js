import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import Phaser from 'phaser';
import createFileLoader from '../flod/file-loader';
import FSXHR from '../fs-xml-http-request';
import Player from './player';

const xmFileName =
  path.join(__static, 'projects', 'antispace', 'music', 'naz.xm');
fs.readFile(xmFileName, (err, data) => {
  const flodFileLoader = createFileLoader();
  const player = flodFileLoader.load(data.buffer);
  player.play();
});

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
      [
        'chink',
        'crunch',
        'footstep',
        'jump',
        'land',
        'pew',
      ].forEach(snd => {
        // TODO: Upgrade to .ogg
        this.load.audio(snd, path.join(AS_SN, `${snd}.wav`));
      });
    }
    create() {
      this
        .setupFrameSounds()
        .setupGroups()
        .setupTilemaps()
        .setupPlayer()
        .setupCollisions()
        .setupCamera()
        .setupInputs();
    }
    
    /**
     * Allows animation frames to play sounds.
     * 
     * The sounds to be played are embedded in the sprite frame data under the
     * key "sound" of each frame. The value is the name of the sound to play.
     * Any animation using that frame will play the sound when it appears.
     */
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

    setupTilemaps() {
      // TODO: Allow loading various tilemaps
      // TODO: Allow the tilemap to determine ALL level content
      this.tilemap = this.add.tilemap('room000');
      // TODO: Load tilesets based on tilemap data
      this.tileset = this.tilemap.addTilesetImage('tileset00');
      // TODO: Allow multiple tilemap layers
      this.tilemapLayer =
        this.tilemap.createStaticLayer(0, this.tileset, 0, 0);
      this.tilemapLayer.setCollisionBetween(64, 128);
      return this;
    }
    
    setupPlayer() {
      this.player = new Player(this, 100, 50);
      this.groups.player.add(this.player.gameObject);
      return this;
    }
    
    setupCollisions() {
      this.physics.add.collider(this.player.gameObject, this.tilemapLayer);
      return this;
    }

    setupCamera() {
      this.cameras.main.setRoundPixels(true);
      this.cameras.main.setBounds(
        0,
        0,
        this.tilemap.widthInPixels,
        this.tilemap.heightInPixels
      );
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
