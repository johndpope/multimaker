// @ts-check
import Phaser from 'phaser/dist/phaser';
import Actor from '../actor';
import PlayerBullet from './player-bullet';

/**
 * Controls the player object.
 */
export default class Player extends Actor {
  /** Horizontal offset of the physical bounding box relative to the sprite */
  bodyOffsetX: number;

  /** Vertical offset of the physical bounding box relative to the sprite */
  bodyOffsetY: number;

  /** of player when standing */
  bodyHStand: number;

  /** of player when crawling */
  bodyHCrawl: number;

  /** player at all times */
  bodyW: number;

  /** Maximum walking velocity on the ground */
  walkSpeedMax: number;

  /** Rate of accelleration when walking */
  walkAccel: number;

  /** at which jump power builds while crouching */
  jumpPowerInc: number;

  /** Maxumim allowed jump power */
  jumpPowerMax: number;

  /** Amount by which horizontal speed increases when leaping */
  leapAccel: number;

  /** Maximum horizontal speed achieveable from leaping */
  leapMax: number;

  /** Factor by which horizontal speed is scaled while crouching or sliding */
  slideFactor: number;

  /** Speed under which sliding stops */
  slideBreak: number;
  
  /** at which the player crawls */
  crawlSpeed: number;
  
  /** Facing direction (0 = left, 1 = right) */
  facing: number;
  
  /** Current amount of power built up for jump */
  jumpPower: number;
  
  /** Whether the player is currently crawling */
  isDucking: boolean;
  
  /** Whether the player is currently sliding */
  isSliding: boolean;
  
  /** Amount of energy available for firing */
  firePower: number;
  
  /** Maximum amount of fire power */
  firePowerMax: number;

  /** Rate at which fire power is recovered */
  firePowerRecovery: number;

  /** Amount of fire power required to fire */
  firePowerCost: number;

  /** Projectile X offset from player position when facing left */
  fireOffsetXLeft: number;

  /** Projectile X offset from player position when facing right */
  fireOffsetXRight: number;

  /** Projectile Y offset from player position */
  fireOffsetY: number;

  /** Maximum speed at which the player is allowed to fall. */
  maxFallSpeed: number;

  /** Whether we were on the floor in the previous update */
  prevOnFloor: boolean;

  /** Amount of power available to AGF */
  agfPower: number;

  /** Maximum power available to AGF */
  agfPowerMax: number;

  /** Whether AGF is currently active */
  agfIsActive: boolean;

  /** Scale factor applied to X velocity while AGF is active */
  agfScaleX: number;

  /** Scale factor applied to X velocity while AGF is active */
  agfScaleY: number;

  flicker: boolean;

  /** Sound effect instance used to play the float sound effect */
  floatSound: any;

  inputs: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    fire: boolean;
  };

  get defaultConfig() {
    return {
      type: 'Player',
      groups: ['player'],
      animations: {
        main: [
          'stand',
          'walk',
          'crawl',
          'slide',
          'duck',
          'crouch',
          'fall',
          'fire',
          'jump',
        ]
      },
    };
  }
  
  setupGameObjects({x = 0, y = 0}) {
    const main = this.room.manager.scene.physics.add.sprite(x, y, 'player');
    main.body.setBounce(0);
    main.body.allowGravity = false;
    return { main };
  }
  
  setupFinal() {
    this.inputs = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      fire: false
    };
    this.firePower = this.firePowerMax;
    this.jumpPower = 0;
    this.prevOnFloor = false;
    this.isSliding = false;
    this.isDucking = false;
    this.agfIsActive = false;
    this.agfPower = this.agfPowerMax;
  }

  onRoomLoad() {
    const {
      gameObjects: {
        main,
        main: { body }
      },
      room: {
        layers,
        manager: { scene }
      }
    } = this;
    // TODO: This will break for rooms that don't have tiles (like the master room)
    scene.physics.add.collider(main, layers[0]);
    body.allowGravity = true;
  }

  get isCrouching() {
    return !!this.jumpPower;
  }

  update() {
    this.flicker = !this.flicker;
    this.updateInput();
    this.updateFirePower();
    this.updateSlide();
    this.updateFall();
    this.updateShape();
    this.updateDisplay();
  }
  
  updateInput() {
    const {
      gameObjects: { main: {
        body,
        body: { velocity: {
          x: vx,
          y: vy
        } }
      } },
      inputs
    } = this;
    this.facing = inputs.left ? 0 : inputs.right ? 1 : this.facing;
    
    if (!(this.isCrouching || this.isDucking) && inputs.fire) {
      this.fire();
    }

    this.gameObjects.main.body.allowGravity = true;
    if (!body.onFloor()) {
      if (inputs.jump && this.agfPower > 0) {
        this.gameObjects.main.body.allowGravity = false;
        this.gameObjects.main.body.setVelocityX(this.gameObjects.main.body.velocity.x * this.agfScaleX);
        this.gameObjects.main.body.setVelocityY(this.gameObjects.main.body.velocity.y * this.agfScaleY);
        this.agfPower -= 1;
      }
      return this;
    }
    this.agfPower = this.agfPowerMax;
    
    if (inputs.down) {
      if (!this.isDucking && vx !== 0) {
        this.isSliding = true;
      }
      this.isDucking = true;
      if (vx === 0) {
        this.isSliding = false;
      }
      if (!this.isSliding) {
        if (inputs.left) {
          this.crawlLeft();
        } else if (inputs.right) {
          this.crawlRight();
        } else {
          this.stopCrawling();
        }
      }
    } else {
      // @todo: Don't allow this if there is an object above
      this.isDucking = false; 
      
      if (inputs.jump) {
        this.buildJump();
        this.isSliding = true;
      } else if (this.jumpPower !== 0) {
        this.releaseJump();
      } else {
        this.isSliding = false;
        if (inputs.left) {
          this.walkLeft();
        } else if (inputs.right) {
          this.walkRight();
        } else {
          this.stopWalking();
        }
      }
    } 
    return this;
  }
  updateFirePower() {
    this.firePower = Math.min(
      this.firePowerMax,
      this.firePower + this.firePowerRecovery
    );
    return this;
  }
  updateSlide() {
    const {
      gameObjects: {
        main,
        main: {
          body,
          body: { velocity: {
            x: vx
          } }
        }
      },
      slideFactor,
      slideBreak
    } = this;
    if (!this.isSliding) {
      return this;
    }
    main.setVelocityX(vx * slideFactor);
    if (Math.abs(vx) < slideBreak) {
      this.isSliding = false;
      main.setVelocityX(0);
    }
    return this;
  }
  updateFall() {
    const {
      room: { manager: { scene } },
      gameObjects: { main, main: { body } },
      maxFallSpeed
    } = this;
    main.setVelocityY(Math.min(maxFallSpeed, body.velocity.y));
    if (body.onFloor()) {
      if (!this.prevOnFloor) {
        scene.sound.play('land');
      }
      this.prevOnFloor = true;
      return this;
    }
    this.prevOnFloor = false;
    this.isDucking = false;
    this.isSliding = false;
    this.jumpPower = 0;
    return this;
  }
  updateShape() {
    const {
      gameObjects: { main: { body } },
      bodyW, bodyHStand, bodyHCrawl, bodyOffsetX, bodyOffsetY,
      isDucking,
      flicker
    } = this;
    body.width = bodyW;
    const correctHeight = (isDucking ? bodyHCrawl : bodyHStand);
    body.height = correctHeight;
    body.setOffset(
      bodyOffsetX,
      bodyOffsetY + (isDucking ? (bodyHStand - bodyHCrawl) : 0)
    );
    return this;
  }
  updateDisplay() {
    const { 
      gameObjects: {
        main,
        main: {
          body,
          body: {
            velocity: {
              x: vx,
              y: vy
            },
            allowGravity
          }
        }
      },
      isSliding,
      isDucking,
      isCrouching,
      facing,
      flicker
    } = this;
    const anim =
      (body.onFloor()) ?
        (isDucking) ?
          (vx === 0) ?
            'duck' :
          (isSliding) ?
            'slide' :
          'crawl' :
        (isCrouching) ?
          'crouch' :
        (Math.abs(vx) > 1) ?
          'walk' :
        'stand' :
      (vy < 0) ?
        'jump' :
      'fall';
    if (main.anims.currentAnim.key !== anim) {
      main.play(anim);
    }
    main.flipX = !facing;
    main.tint = (!allowGravity) ? (flicker ? 0x00ff88 : 0x88ffff) : 0xffffff;
    main.blendMode = (!allowGravity && flicker) ? 1 : 0;
    if (!allowGravity) {
      if (!this.floatSound) {
        this.floatSound = this.room.manager.scene.sound.add('float');
        this.floatSound.play();
      }
    } else {
      if (this.floatSound) {
        this.floatSound.stop();
        this.floatSound = null;
      }
    }
    return this;
  }
  fire() {
    const {
      gameObjects: { main: { body: {
        x: myX,
        y: myY
      } } },
      room,
      facing,
      firePowerCost,
      fireOffsetXLeft,
      fireOffsetXRight,
      fireOffsetY
    } = this;
    if (this.firePower >= firePowerCost) {
      const x = myX + (facing ? fireOffsetXRight : fireOffsetXLeft);
      const y = myY + fireOffsetY;
      const properties = { facing };
      new PlayerBullet({ room, x, y, properties });
      this.firePower -= firePowerCost;
    }
    return this;
  }
  buildJump() {
    this.jumpPower = Math.min(
      this.jumpPower + this.jumpPowerInc,
      this.jumpPowerMax
    );
    return this;
  }
  releaseJump() {
    const {
      gameObjects: {
        main,
        main: {
          body,
          body: { velocity: {
            x: vx,
            y: vy
          } }
        }
      },
      room: { manager: { scene } },
      jumpPower
    } = this;
    scene.sound.play('jump');
    body.setVelocityY(-jumpPower);
    if (vx === 0) {
      return this;
    }
    const { leapMax, leapAccel, facing } = this;
    main.setVelocityX((facing === 1) ?
      Math.min(leapMax, vx + leapAccel) :
      Math.max(-leapMax, vx - leapAccel));
    return this;
  }
  walkLeft() {
    const {
      gameObjects: {
        main,
        main: { body: { velocity: { x: vx } } }
      },
      walkAccel, walkSpeedMax
    } = this;
    main.setVelocityX(Math.max(vx - walkAccel, -walkSpeedMax));
    return this;
  }
  walkRight() {
    const {
      gameObjects: {
        main,
        main: { body: { velocity: { x: vx } } }
      },
      walkAccel,
      walkSpeedMax
    } = this;
    main.setVelocityX(Math.min(vx + walkAccel, walkSpeedMax));
    return this;
  }
  stopWalking() {
    const {
      gameObjects: {
        main,
        main: { body: { velocity: { x: vx, y: vy } } }
      },
      walkAccel
    } = this;
    this.isSliding = false;
    if (vx === 0) {
      return;
    }
    main.setVelocityX(
      (vx > 0) ? Math.max(vx - walkAccel, 0) : Math.min(vx + walkAccel, 0)
    );
    return this;
  }
  crawlLeft() {
    this.gameObjects.main.setVelocityX(-this.crawlSpeed);
    return this;
  }
  crawlRight() {
    this.gameObjects.main.setVelocityX(this.crawlSpeed);
    return this;
  }
  stopCrawling() {
    this.gameObjects.main.setVelocityX(0);
    return this;
  }
}
