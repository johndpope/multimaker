import Phaser from 'phaser';
import GameObjectController from '.';
import PlayerBullet from './player-bullet';

/**
 * Controls the player object.
 * 
 * Should NOT contain code that pertains to other objects or game-global data.
 */
export default class Player extends GameObjectController {
  /**
   * @prop {number} bodyOffsetX Horizontal offset of the physical bounding box relative to the sprite
   */
  
  /**
   * @prop {number} bodyOffsetY Vertical offset of the physical bounding box relative to the sprite
   */
  
  /**
   * @prop {number} bodyHStand of player when standing
   */
  
  /**
   * @prop {number} bodyHCrawl of player when crawling
   */
  
  /**
   * @prop {number} bodyW player at all times
   */
  
  /**
   * @prop {number} walkSpeedMax Maximum walking velocity on the ground
   */
  
  /**
   * @prop {number} walkAccel Rate of accelleration when walking
   */
  
   /**
    * @prop {number} jumpPowerInc at which jump power builds while crouching
    */
  
   /**
    * @prop {number} jumpPowerMax Maxumim allowed jump power
    */
  
   /**
    * @prop {number} leapAccel Amount by which horizontal speed increases when leaping
    */
  
   /**
    * @prop {number} leapMax Maximum horizontal speed achieveable from leaping
    */
  
   /**
    * @prop {number} slideFactor Factor by which horizontal speed is scaled while crouching or sliding
    */
  
   /**
    * @prop {number} slideBreak Speed under which sliding stops
    */
  
   /**
    * @prop {number} crawlSpeed at which the player crawls
    */

  /**
   * @prop {number} facing Facing direction (0 = left, 1 = right)
   */

  /**
   * @prop {number} jumpPower Current amount of power built up for jump
   */

  /**
   * @prop {number} isDucking Whether the player is currently crawling
   */

  /**
   * @prop {number} isSliding Whether the player is currently sliding
   */

  /**
   * @prop {number} firePower Amount of energy available for firing
   */

  /**
   * @prop {number} firePowerMax Maximum amount of fire power
   */

  /**
   * @prop {number} firePowerRecovery Rate at which fire power is recovered
   */

  /**
   * @prop {number} firePowerCost Amount of fire power required to fire
   */

  /**
   * @prop {number} fireOffsetXLeft Projectile X offset from player position when facing left
   */

  /**
   * @prop {number} fireOffsetXLeft Projectile X offset from player position when facing right
   */

  /**
   * @prop {number} fireOffsetY Projectile Y offset from player position
   */
  
  /**
   * @prop {boolean} prevOnFloor Whether we were on the floor in the previous update
   */
  
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene.groups.player.add(this);
  }

  get defaultConfig() {
    return {
      bodyHCrawl: 6,
      bodyHStand: 14,
      bodyOffsetX: 4,
      bodyOffsetY: 2,
      bodyW: 8,
      crawlSpeed: 30,
      facing: 1,
      fireOffsetXLeft: -24,
      fireOffsetXRight: 8,
      fireOffsetY: 0,
      firePower: 30,
      firePowerCost: 30,
      firePowerMax: 30,
      firePowerRecovery: 2,
      isDucking: false,
      isSliding: false,
      jumpPower: 0,
      jumpPowerInc: 8,
      jumpPowerMax: 180,
      leapAccel: 40,
      leapMax: 120,
      maxFallSpeed: 300,
      prevOnFloor: false,
      slideBreak: 10,
      slideFactor: 0.97,
      walkAccel: 10,
      walkSpeedMax: 90,
    };
  }

  get animationNames() {
    return {
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
    };
  }

  /**
   * @param {number} x 
   * @param {number} y 
   * @return {Phaser.GameObject[]}
   */
  setupGameObjects(x, y) {
    const main = this.scene.physics.add.sprite(x, y, 'charles');
    main.body.setBounce(0);
    return { main };
  }

  get isCrouching() {
    return !!this.jumpPower;
  }

  /**
   * @param {InputMap} inputs 
   */
  update(inputs) {
    return this
      .updateInput(inputs)
      .updateFirePower()
      .updateSlide()
      .updateFall()
      .updateShape()
      .updateDisplay();
  }
  /**
   * @param {InputMap} inputs 
   */
  updateInput(inputs) {
    this.facing = inputs.left ? 0 : inputs.right ? 1 : this.facing;
    
    if (!(this.isCrouching || this.isDucking) && inputs.fire) {
      this.fire();
    }
    
    const { body, body: { velocity: { x: vx, y: vy } } } = this.main;

    if (!body.onFloor()) {
      return this;
    }
    
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
    const { main, slideFactor, slideBreak } = this;
    const { body } = main;
    if (!this.isSliding) {
      return this;
    }
    main.setVelocityX(body.velocity.x * slideFactor);
    if (Math.abs(body.velocity.x) < slideBreak) {
      this.isSliding = false;
      main.setVelocityX(0);
    }
    return this;
  }
  updateFall() {
    const { maxFallSpeed, scene, main } = this;
    const { body } = main;
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
    const { main, bodyHStand, bodyW, bodyHCrawl, bodyOffsetX, bodyOffsetY,
      isDucking } = this;
    const { body } = main;
    body.width = bodyW;
    const correctHeight = isDucking ? bodyHCrawl : bodyHStand;
    const deltaHeight = body.height - correctHeight;
    body.height = correctHeight;
    body.setOffset(
      bodyOffsetX,
      bodyOffsetY + (isDucking ? (bodyHStand - bodyHCrawl) : 0)
    );
    return this;
  }
  updateDisplay() {
    const { main, isSliding, isDucking, isCrouching, facing } = this;
    const { body } = main;
    const { x: vx, y: vy } = main.body.velocity;
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
    return this;
  }
  fire() {
    const { firePower, firePowerCost, main, fireOffsetXLeft, fireOffsetXRight,
      fireOffsetY, facing, scene } = this;
    const { x, y } = main.body;
    if (firePower >= firePowerCost) {
      const pbX = x + (facing ? fireOffsetXRight : fireOffsetXLeft);
      const pbY = y + fireOffsetY;
      new PlayerBullet(scene, pbX, pbY, facing);
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
    const { scene, main, jumpPower } = this;
    const { body } = main;
    const { x: vx, y: vy } = body.velocity;
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
    const {main: {body: {velocity: {x: vx}}}, walkAccel, walkSpeedMax} = this;
    this.main.setVelocityX(Math.max(vx - walkAccel, -walkSpeedMax));
    return this;
  }
  walkRight() {
    const {main: {body: {velocity: {x: vx}}}, walkAccel, walkSpeedMax} = this;
    this.main.setVelocityX(Math.min(vx + walkAccel, walkSpeedMax));
    return this;
  }
  stopWalking() {
    const { walkAccel, main } = this;
    const { x: vx, y: vy } = main.body.velocity;
    this.isSliding = false;
    if (vx === 0) {
      return;
    }
    main.setVelocity(
      (vx > 0) ? Math.max(vx - walkAccel, 0) : Math.min(vx + walkAccel, 0)
    );
    return this;
  }
  crawlLeft() {
    this.main.setVelocityX(-this.crawlSpeed);
    return this;
  }
  crawlRight() {
    this.main.setVelocityX(this.crawlSpeed);
    return this;
  }
  stopCrawling() {
    this.main.setVelocityX(0);
    return this;
  }
}
