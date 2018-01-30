// @ts-check
import * as path from 'path';
import * as fs from 'fs';
import _ from 'lodash';
import Phaser from 'phaser';
import Scene from 'phaser/src/scene/Scene';
import flod from '../flod';

import actors from './actors';
import { RoomManager } from './rooms';

export default class Game extends Phaser.Game {
  /**
   * @param {string} projectPath Absolute path to the project to be opened
   * @param {HTMLElement} parent HTML element into which the Phaser canvas will be inserted
   */
  constructor(projectPath, parent) {
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
          debug: true,
          gravity: {
            y: 450
          }
        }
      },
      scene: new RootScene(projectPath)
    });
  }
}
  
class RootScene extends Phaser.Scene {
  /**
   * @param {string} projectPath Absolute path to the project to be opened
   */
  constructor(projectPath) {
    super();
    this.projectPath = projectPath;
  }
  init() {
    // DEBUG: Expose scene globally
    window.scene = this;
  }
  preload() {
    const { projectPath } = this;

    this.load.json(
      'actor_assets',
      path.join(projectPath, 'actor_assets.json')
    );

    this.load.json(
      'actor_properties',
      path.join(projectPath, 'actor_properties.json')
    );

    const AN = path.join(projectPath, 'an');
    [
      'player',
      'player_bullet'
    ].forEach(anim => {
      this.load.animation(anim, path.join(AN, `${anim}.json`));
    });

    const BG = path.join(projectPath, 'bg');
    [
      'area_0_0',
      'area_0_1',
      'area_0_2',
      'area_0_3',
      'area_0_4',
    ].forEach(bg => {
      this.load.image(bg, path.join(BG, `${bg}.png`));
    });

    const MU = path.join(projectPath, 'mu');
    [
      'area_0'
    ].forEach(mu => {
      this.load.binary(mu, path.join(MU, `${mu}.xm`));
    });

    const SO = path.join(projectPath, 'so');
    [
      'crunch',
      'footstep',
      'jump',
      'land',
      'player_bullet_impact',
      'player_bullet',
    ].forEach(snd => {
      // TODO: Upgrade to .ogg
      this.load.audio(snd, path.join(SO, `${snd}.wav`));
    });

    const SP = path.join(projectPath, 'sp');
    [
      'player',
      'player_bullet'
    ].forEach(spr => {
      this.load.atlas(
        spr,
        path.join(SP, `${spr}.png`),
        path.join(SP, `${spr}.json`)
      );
    });

    const TM = path.join(projectPath, 'tm');
    [
      'master',
      'area_0_0',
      'area_0_1'
    ].forEach(tm => {

      this.load.tilemapTiledJSON(tm, path.join(TM, `${tm}.json`));
    });
    
    const TS = path.join(projectPath, 'ts');
    [
      'area_0'
    ].forEach(ts => {
      this.load.image(ts, path.join(TS, `${ts}.png`));
    });
  }
  create() {
    setTimeout(() => {
      this
        .setupFrameSounds()
        .setupGroups()
        .setupRooms()
        .setupCamera()
        .setupInputs();
    }, 3000);
  }

  setupRooms() {
    const assets = this.cache.json.get('actor_assets');
    const properties = this.cache.json.get('actor_properties');
    this.rooms = new RoomManager(this, actors, assets, properties);
    // TODO: Load the master room instead of an arbitrary area
    this.area_0_0 = this.rooms.load('area_0_0');
    this.player = this.area_0_0.actors.find(g => g instanceof actors.Player);
    this.cameras.main.startFollow(this.player.gameObjects.main);
    this.cameras.main.setBounds(
      this.area_0_0.x,
      this.area_0_0.y,
      this.area_0_0.tilemap.widthInPixels,
      this.area_0_0.tilemap.heightInPixels
    )
    return this;
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
      boundary: this.add.group(),
      player: this.add.group(),
      bullet: this.add.group()
    };
    return this;
  }

  setupCamera() {
    this.cameras.main.setRoundPixels(true);
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
    if (!this.area_0_0) {
      return;
    }
    this.area_0_0.update();
    if (!this.player) {
      return;
    }
    this.player.inputs = this.getInputs();
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
