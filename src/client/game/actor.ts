import GameObject from 'phaser/src/gameobjects/GameObject';
import * as _ from 'lodash';
import { Room } from './rooms';

export type ActorConfig = {
  /**
   * Room in which this Actor is being created
   */
  room: Room;
  /**
   * Name string that was used to create this object
   */
  name: string;
  /**
   * Type string that was used to create this object
   */
  type: string;
  /**
   * Initial X position of the main GameObject for this Actor
   */
  x: number;
  /**
   * Initial Y position of the main GameObject for this Actor
   */
  y: number;

  /**
   * Map of arrays of animations for each game object
   */
  animations?: { [key: string]: string[] };

  /**
   * Array of the names of groups the main config should be added to
   */
  groups?: string[];
  /**
   * Externally-configurable properties
   */
  properties: { [key: string]: PropValue };
};

export type PropValue = (string | number | boolean);

export type ActorClass<T = Actor> = new(cfg: ActorConfig) => T;

/**
 * Controls Phaser GameObjects.
 * 
 * This is not a GameObject itself and it does not directly appear inside of any
 * scenes.
 */
export default class Actor {
  room: Room;
  type: string;
  name: string;
  properties: {[key: string]: PropValue};
  gameObjects: {[key: string]: GameObject};

  constructor(/** @type {ActorConfig} */ cfg) {
    cfg = Object.assign({}, this.defaultConfig, cfg);
    this.room = cfg.room;
    this.type = this.processType(cfg);
    this.name = this.processName(cfg);
    this.properties = this.setupProperties(cfg);
    Object.assign(this, this.properties);
    this.gameObjects = this.setupGameObjects(cfg);
    this.setupGroups(cfg);
    this.setupAnimations(cfg);
    this.setupFinal(cfg);
  }

  get defaultConfig() {
    return {};
  }
  
  processName(/** @type {ActorConfig} */ { name }) {
    return name || null;
  }
  
  processType(/** @type {ActorConfig} */ { type }) {
    return type || this.constructor.name;
  }

  setupProperties(/** @type {ActorConfig} */ {properties = {}}) {
    return Object.assign(
      {}, 
      this.room.manager.manifest[this.type].properties,
      properties,
    );
  }

  /**
   * Return a mapping of all game objects this controller wants added to its scene.
   * 
   * These objects will also be removed when this controller is destroyed.
   * 
   * The key 'main' is used to refer to the primary game object, which has
   * special significance to the scene.
   * 
   * @return {{ [key: string]: GameObject }}
   */
  setupGameObjects({x = 0, y = 0}) {
    return {};
  }

  setupGroups(/** @type {ActorConfig} */ {groups = []}) {
    if (!this.gameObjects || !this.gameObjects.main) {
      return;
    }
    groups.forEach(group => {
      this.room.manager.scene.groups[group].add(this.gameObjects.main);
    });
  }

  setupAnimations({animations = {}}) {
    if (!this.gameObjects) {
      return;
    }
    _.each(this.gameObjects, ({ anims }, spriteKey) => {
      const spriteAnimations = animations[spriteKey];
      if (!(spriteAnimations && anims)) {
        return;
      }
      spriteAnimations.forEach(spriteAnimation => {
        anims.load(spriteAnimation);
      });
    });
  }

  setupFinal(cfg) { }

  /**
   * Executed by the room when all Actors have been added to the room.
   */
  onRoomLoad() { }

  update() { }
}
