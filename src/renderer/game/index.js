import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import Phaser from 'phaser';
import flod from '../flod';
import Player from './player';

export default class Game extends Phaser.Game {
  /**
   * @param {HTMLElement} parent 
   */
  constructor(parent) {
    super({
      parent,
      type: Phaser.WEBGL,
      width: 400,
      height: 225,
      pixelArt: true,
      physics: {
        // @todo: Switch to 'matter' so we can use sloped tiles
        default: 'arcade',
        arcade: {
          gravity: {
            y: 450
          }
        }
      },
      scene: new RootScene()
    });
  }
}
  
class RootScene extends Phaser.Scene {
  init() {
    // DEBUG: Expose scene globally
    window.scene = this;
  }
  preload() {
    const AS = path.join(__dirname, '..', '..', '..', 'assets', 'projects', 'antispace');

    const AS_SP = path.join(AS, 'sprites');
    [
      'charles',
      'laser'
    ].forEach(spr => {
      this.load.atlas(
        spr,
        path.join(AS_SP, `${spr}.png`),
        path.join(AS_SP, `${spr}.json`)
      );
    });
    
    const AS_AN = path.join(AS, 'animations');
    [
      'charlesAnim',
      'laserAnim'
    ].forEach(anim => {
      this.load.animation(anim, path.join(AS_AN, `${anim}.json`));
    });
    
    const AS_TS = path.join(AS, 'tiles');
    this.load.image('tileset00', path.join(AS_TS, 'tsNAZ.png'));
    
    const AS_TM = path.join(AS, 'maps');
    this.load.tilemapTiledJSON('room000', path.join(AS_TM, 'room000.json'));

    const AS_SO = path.join(AS, 'sounds');
    [
      'chink',
      'crunch',
      'footstep',
      'jump',
      'land',
      'pew',
    ].forEach(snd => {
      // TODO: Upgrade to .ogg
      this.load.audio(snd, path.join(AS_SO, `${snd}.wav`));
    });

    const AS_MU = path.join(AS, 'music');
    this.load.binary('nazXm', path.join(AS_MU, 'naz.xm'));
  }
  create() {
    setTimeout(() => {
      this
        .setupFrameSounds()
        .setupGroups()
        .setupTilemaps()
        .setupPlayer()
        .setupCollisions()
        .setupCamera()
        .setupInputs();
    }, 3000);
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
    flod.load(this.cache.binary.get('nazXm')).play();
    
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
    this.player = new Player(this, 100,100);
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
    const kb = this.input.keyboard;
    const KC = Phaser.Input.Keyboard.KeyCodes;
    this.keyInputs = {
      left: kb.addKey(KC.LEFT),
      right: kb.addKey(KC.RIGHT),
      up: kb.addKey(KC.UP),
      down: kb.addKey(KC.DOWN),
      jump: kb.addKey(KC.S),
      fire: kb.addKey(KC.D),
    };
    return this;
  }

  update() {
    if (!this.player) {
      return;
    }
    this.player.update(this.getInputs());
  }

  getInputs() {
    const { keyInputs: {
      left: { isDown: left },
      right: { isDown: right },
      up: { isDown: up },
      down: { isDown: down },
      jump: { isDown: jump },
      fire: { isDown: fire }
    } } = this;
    return {
      left: left && !right,
      right: right && !left,
      up: up && !down,
      down: down && !up,
      jump,
      fire
    };
  }
}
