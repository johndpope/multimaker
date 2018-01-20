const Phaser = require('phaser/dist/phaser');
new Phaser.Game({
  
  type: Phaser.WEBGL,
  width: 400,
  height: 225,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {
        y: 450
      }
    }
  },
  
  scene: new class extends Phaser.Scene {
    preload() {
      window.scene = this;
      const R_AS = '../assets/antispace';
      
      const R_AS_SP = `${R_AS}/sprites`;
      this.load.atlas('charles', `${R_AS_SP}/charles.png`, `${R_AS_SP}/charles.json`);
      
      const R_AS_TS = `${R_AS}/tiles`;
      this.load.image('tileset00', `${R_AS_TS}/tsNAZ.png`);

      // --- //

      const P_AS = '../projects/antispace';
      
      const P_AS_M = `${P_AS}/maps`;
      this.load.tilemapJSON('room000', `${P_AS_M}/room000.json`);
    }

    create() {
      this.player = this.physics.add.sprite(100, 50, 'charles');
      this.player.body.setBounce(0);
      
      this.tm = this.add.tilemap('room000');
      this.ts = this.tm.addTilesetImage('tileset00');
      this.layer = this.tm.createStaticLayer(0, this.ts, 0, 0);
      this.layer.setCollisionBetween(64,128);
      
      this.physics.add.collider(this.player, this.layer);
      
      this.cameras.main.setBounds(0, 0, this.tm.widthInPixels, this.tm.heightInPixels);
      this.cameras.main.startFollow(this.player);

      this.cursors = this.input.keyboard.createCursorKeys();
      this.jumpPower = 0;
      this.jumpPowerInc = 10;
      this.jumpPowerMax = 200;
    }

    update() {
      if (this.player.body.onFloor()) {
        this.player.body.setVelocityX(0);
        if (this.cursors.left.isDown) {
          this.player.body.setVelocityX(-100);
        } else if (this.cursors.right.isDown) {
          this.player.body.setVelocityX(100);
        }
        if ((this.cursors.space.isDown || this.cursors.up.isDown)) {
          //this.player.body.setVelocityY(-150);
          this.jumpPower = Math.min(
            this.jumpPower + this.jumpPowerInc,
            this.jumpPowerMax
          );
        } else {
          this.player.body.setVelocityY(-this.jumpPower);
          this.jumpPower = 0;
        }
      }
      if (Math.abs(this.player.body.velocity.x) < 1) {
        this.player.x = Math.round(this.player.x);
      }
      if (Math.abs(this.player.body.velocity.y) < 1) {
        this.player.y = Math.round(this.player.y);
      }
    }
  }
});

