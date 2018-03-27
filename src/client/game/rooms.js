// @ts-check
import * as path from 'path';
import * as _ from 'lodash';
import Scene from 'phaser/src/scene/Scene';
import Actor, { ActorClass } from './actor';

/**
 * @typedef {{[key: string]: ActorManifestEntry}} ActorManifest Describes how tilemap data should be used to load scene content
 */

/**
 * @typedef {Object} ActorManifestEntry
 * @prop {ActorClass} class Actor class/constructor
 * @prop {ActorManifestAssetMapEntry} assets Asset map associated with class
 * @prop {ActorManifestPropertyMap} properties Default properties
 */

/**
 * @typedef {{[key: string]: ActorClass}} ActorClassMap
 */

/**
 * @typedef {{[key: string]: ActorManifestAssetMapEntry}} ActorManifestAssetMap
 */

/**
 * @typedef {Object} ActorManifestAssetMapEntry
 * @prop {string[]} an Animations
 * @prop {string[]} so Sounds
 * @prop {string[]} sp Sprites (atlas + image)
 */

/**
 * @typedef {{[key: string]: (string|number|boolean)}} ActorManifestPropertyMap
 */

/**
 * @typedef {Object} ActorManifestPropertyListEntry
 * @prop {string} name
 * @prop {ActorManifestPropertyDef[]} properties
 */

/**
 * @typedef {Object} ActorManifestPropertyDef
 * @prop {string} name
 * @prop {ActorManifestPropertyDefType} type
 * @prop {string} value
 */

/**
 * @typedef {("string"|"number"|"boolean")} ActorManifestPropertyDefType
 */

/**
 * Room manager.
 */
export class RoomManager {
  /**
   * @param {Scene} scene
   * @param {ActorClassMap} classes
   * @param {ActorManifestAssetMap} assets
   * @param {ActorManifestPropertyListEntry[]} propertyList
   */
  constructor(scene, classes, assets, propertyList) {
    this.scene = scene;
    /** @type {{[key: string]: Room}} */
    this.rooms = {};
    this.setupManifest(classes, assets, propertyList);
  }
  setupManifest(classes, assets, propertyList) {
    const propertyDefs =
    _.transform(propertyList, (m, { name, properties }) => {
      m[name] = properties;
    }, {});
    this.manifest = _.transform(classes, (m, Class, key) => {
      m[key] = {
        class: Class,
        assets: assets[key],
        properties:
        _.transform(propertyDefs[key], (m, { name, type, value }) => {
          m[name] =
          (type === 'string') ? `${value}` :
          (type === 'int') ? parseInt(value) :
          (type === 'float') ? parseFloat(value) :
          (type === 'bool') ? !!value :
          null;
        }, {})
      };
    }, {});
  }
  /**
   * Create and populate a room if it is not already present.
   * 
   * @param {string} key Key of tilemap on which room is based.
   * @param {number} x X offset for all content in the room
   * @param {number} y Y offset for all content in the room
   */
  load(key, x=0, y=0) {
    if (key in this.rooms) {
      return this.rooms[key];
    }
    return this.rooms[key] = new Room(this, key, x, y)
  }
}

/**
 * Room.
 * 
 * See the README for details about how Rooms work.
 */
export class Room {
  /**
   * @param {RoomManager} manager 
   * @param {string} key 
   * @param {number} [x]
   * @param {number} [y]
   */
  constructor(manager, key, x=0, y=0) {
    this.manager = manager;
    this.key = key;
    this.x = x;
    this.y = y;
    this.images = [];
    this.tilesets = [];
    this.layers = [];
    /** @type {Actor[]} */
    this.actors = [];
    this.setupBoundary();
    this.setupTilemap();
    const { data } = this.manager.scene.cache.tilemap.get(this.key);
    this.setupTilesets(data);
    this.setupLayers(data);
    this.setupLoad();
  }
  setupBoundary() {
    const { key, manager: { rooms: { master } } } = this;
    this.boundary =
      master && _.find(master.actors, { type: "RoomBoundary", key }) || null;
  }
  
  // TODO: Add a group for the room?

  setupTilemap() {
    this.tilemap = this.manager.scene.add.tilemap(this.key);
  }
  setupTilesets({ tilesets }) {
    const _ = undefined;
    tilesets.forEach(({ name, image, firstgid }, i) => {
      if (i > 1) {
        throw new Error("TODO: Multiple tilesets not supported");
      }
      const key = path.basename(image, path.extname(image));
      this.tilesets.push(
        this.tilemap.addTilesetImage(name, key, _, _, _, _, firstgid)
      );
    });
  }
  setupLayers(data) {
    data.layers.forEach((layer, i) => {
      const { type } = layer;
      switch (type) {
        case 'imagelayer':
          this.setupImageLayer(layer);
          break;
        case 'tilelayer':
          this.setupTileLayer(layer);
          break;
        case 'objectgroup':
          this.setupObjectLayer(layer);
          break;
        default:
          throw new Error(`Unknown layer type: ${type}`);
      }
    })
  }
  setupImageLayer({image, x, y, properties }) {
    const key = path.basename(image, path.extname(image));
    const {
      x: ox,
      y: oy,
      images,
      manager: { scene },
      tilemap: {
        widthInPixels,
        heightInPixels
      }
    } = this;
    const obj = scene.add.tileSprite(
      ox + x,
      oy + y,
      widthInPixels,
      heightInPixels,
      key
    );
    const { originX, originY, scrollFactorX, scrollFactorY } = properties;
    obj.originX = parseFloat(originX || 0);
    obj.originY = parseFloat(originY || 0);
    obj.scrollFactorX = parseFloat(scrollFactorX || 0);
    obj.scrollFactorY = parseFloat(scrollFactorY || 0);
    images.push(obj);
    return obj;
  }
  setupTileLayer({ name, x, y }) {
    const {
      x: ox,
      y: oy,
      tilemap,
      tilesets,
      layers
     } = this;
    // TODO: Support multiple tilesets
    const tmX = x + ox;
    const tmY = y + oy;
    const tm = tilemap.createDynamicLayer(name, tilesets[0], tmX, tmY);
    // TODO: Allow the collision ranges to be set from the tilemap
    tm.setCollisionBetween(64, 128);
    layers.push(tm);
    return tm;
  }
  setupObjectLayer({ name: layerName, objects, x: layerX, y: layerY }) {
    const {
      x: ox,
      y: oy,
      key,
      actors,
      manager: {
        scene,
        manifest
      }
    } = this;
    objects.forEach(({
      name,
      properties: objProps,
      type: objType,
      x: objX,
      y: objY
    }, i) => {
      const type =
        objType ? objType :
        (layerName in manifest) ? layerName :
        null;
      if (!type) {
        const debug = JSON.stringify({ mapKey: key, layerName, i });
        throw new Error(`Unknown object type. Location: ${debug}`);
      }
      const room = this;
      const x = ox + layerX + objX;
      const y = oy + layerY + objY;
      const properties = objProps || {};
      const cfg = { name, type, x, y, properties, room };
      const actor = new (manifest[type].class)(cfg);
      this.actors.push(actor);
    });
  }
  setupLoad() {
    this.actors.forEach(actor => {
      actor.onRoomLoad();
    })
  }
  update() {
    this.actors.forEach(actor => {
      actor.update();
    })
  }
}

