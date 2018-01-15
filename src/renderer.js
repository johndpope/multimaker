// @ts-check
/// <reference path="../node_modules/phaser-ce/typescript/pixi.d.ts" />
/// <reference path="../node_modules/phaser-ce/typescript/p2.d.ts" />
/// <reference path="../node_modules/phaser-ce/typescript/phaser.d.ts" />

// See: https://github.com/photonstorm/phaser-ce#getting-started

// @ts-ignore
window.PIXI = require('phaser-ce/build/custom/pixi')

// @ts-ignore
window.p2 = require('phaser-ce/build/custom/p2')

// @ts-ignore
window.Phaser = require('phaser-ce/build/custom/phaser-split')

const State0 = require('./State0');

window.onload = () => {
  const game = new Phaser.Game({
    width: 320,
    height: 180,
    antialias: false,
    transparent: true,
    resolution: 2,
    state: new State0()
  })
}
