// @ts-check
/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />

const promisify = require('es6-promisify')
const fs = require('fs')
const path = require('path')
const  _ = require('lodash');

const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)
const access = promisify(fs.access)

/**
 * Used for finding and loading asset packs.
 * 
 * **Note about Asynchronous Loading**
 * 
 * This uses Node fs API, which is asynchronous. Therefore the assets will not
 * automatically begin loading, but will instead be merely queued to load. You
 * may have to manually call game.load.start() once all assets have been
 * queued.
 */
class AssetManager {
  /**
   * @param {Phaser.Game} game Phaser game for this manager to use
   * @param {string} path Directory in which to search for asset packs.
   */
  constructor(game, path) {
    this.game = game
    this.path = path
  }
  /**
   * Return a set of available asset packs.
   * 
   * The assets of the packs will not be initially loaded.
   * 
   * @return {Promise<{[key: string]: AssetPack}>}
   */
  async findPacks() {
    const { path: p } = this;
    return _.transform(await readdir(p), (result, f, i) => {
      const bn = path.basename(f)
      const pf = path.join(p, f)
      result[bn] = new AssetPack(this, bn, pf)
    }, {})
  }
}

/**
 * @todo Use the correct category class depending on the category
 * @todo Allow other formats of asset packs besides directories
 */
class AssetPack {
  /**
   * @param {AssetManager} manager Manager of this asset pack
   * @param {string} path Path to this asset pack
   * @param {string} name Name of this asset pack
   */
  constructor (manager, name, path) {
    this.manager = manager
    this.name = name
    this.path = path
  }
  get game() {
    return this.manager.game
  }
  /**
   * Return whether this asset pack is a directory
   * 
   * @todo Only return true when the asset path is actually a directory
   */
  get isDirectory() {
    return true
  }
  /**
   * Return a list of the categories of assets in this pack
   * @return {Promise<{[key: string] : AssetCategory}>}
   */
  async findCategories() {
    const { path: p } = this
    return _.transform(await readdir(p), (result, f, i) => {
      const bn = path.basename(f)
      const pf = path.join(p, f)
      result[bn] =
        (bn === 'sprites') ?
          new SpriteAssetCategory(this, bn, pf) :
        new AssetCategory(this, bn, pf)
    }, {})
  }
}

/**
 * Base for asset categories
 * @abstract
 */
class AssetCategory {
  /**
   * @param {AssetPack} pack Parent asset pack for this category
   * @param {string} name Name of this category
   * @param {string} path Path to this category
   */
  constructor (pack, name, path) {
    this.pack = pack
    this.name = name
    this.path = path
  }
  get game() {
    return this.pack.game
  }
  /**
   * Return a list of the names of assets in this pack
   * @return {Promise<{[key: string]: AssetWrapper}>}
   */
  async findAssets() {
    return {}
  }
}

class SpriteAssetCategory extends AssetCategory {
  constructor(pack, name, path) {
    super(pack, name, path)
  }
  /**
   * Return a list of the names of assets in this pack
   * @return {Promise<{[key: string]: SpriteAssetWrapper}>}
   */
  async findAssets() {
    const { path: p } = this
    const files = (await readdir(p))
      .filter(f => path.extname(f).toLowerCase() === '.png')
    const fstats = await Promise.all(files.map(f => stat(path.join(p, f))))
    const wrappers = _.transform(files, (result, f, i) => {
      const bn = path.basename(f, path.extname(f))
      if (fstats[i].isFile) {
        result[bn] = new SpriteAssetWrapper(this, bn, path.join(p, f))
      }
    }, {})
    return wrappers
  }
}

class AssetWrapper {
  /**
   * @param {AssetCategory} category
   * @param {string} name
   * @param {string} path
   */
  constructor(category, name, path) {
    this.category = category
    this.name = name
    this.path = path
    this.isLoaded = false
  }
  get game() {
    return this.category.game
  }
  async load() {
    return null
  }
}

class SpriteAssetWrapper extends AssetWrapper {
  /**
   * @param {SpriteAssetCategory} category
   * @param {string} name
   * @param {string} path
   */
  constructor(category, name, path) {
    super(category, name, path)
  }
  async load() {
    const dn = path.dirname(this.path)
    const bn = path.basename(this.path, path.extname(this.path))
    const jsonPath = path.join(dn, `${bn}.json`)
    let promise = new Promise((resolve, reject) => {
      this.game.load.onFileComplete.add((__, key, success) => {
        if (key === this.name) {
          if (success) {
            resolve()
          } else {
            reject()
          }
        }
      })
    })
    this.game.load.atlas(this.name, this.path, jsonPath)
    await promise
    this.isLoaded = true
  }
}

module.exports = {
  AssetManager,
  AssetPack,
  AssetCategory,
  SpriteAssetCategory,
  AssetWrapper,
  SpriteAssetWrapper,
}
