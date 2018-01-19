require('phaser/dist/phaser')

var config = {
  type: Phaser.WEBGL,
  parent: 'phaser-example',
  width: 320,
  height: 180,
  scene: {
    preload: preload,
    create: create
  }
};

var game = new Phaser.Game(config);

function preload() {
  
}

function create() {

}
