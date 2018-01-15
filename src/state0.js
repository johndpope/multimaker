/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />

const path = require('path')
const { AssetManager } = require('./am')

module.exports = class State0 extends Phaser.State {
  preload() {
    const assetsPath = path.join(__dirname, '..', 'assets')
    const am = new AssetManager(this.game, assetsPath)
    am.findPacks()
      .then(({ antispace }) => antispace.findCategories())
      .then(({ sprites }) => sprites.findAssets())
      .then(({ charles }) => { charles.load() })
  }
  create() {
    
  }
}
