const Phaser = require('phaser/dist/phaser');
new Phaser.Game({
  type: Phaser.WEBGL,
  parent: 'phaser-example',
  width: 320,
  height: 180,
  
  scene: new (class extends Phaser.Scene {
    preload() {
      const AS = '../assets/antispace';
      const SP = `${AS}/sprites`;
      this.load.atlas('charles', `${SP}/charles.png`, `${SP}/charles.json`);
    }

    create() {
      this.add.image(30, 30, 'charles')
    }
  })
});

