const Phaser = require('phaser/dist/phaser');

/**
 * @typedef {Object} InputMap
 * @prop {boolean} left
 * @prop {boolean} right
 * @prop {boolean} crouch
 */

/**
 * Describes behavior of the player object.
 * 
 * Should NOT contain code that pertains to other objects or game-global data.
 */
module.exports = class Player {
  /**
   * @param {Phaser.Scene} scene 
   * @param {number} x
   * @param {number} y
   */
  constructor(scene, x, y) {
    /**
     * Scene that created this player
     */
    this.scene = scene;
    
    /**
     * Horizontal offset of the physical bounding box relative to the sprite
     */
    this.bodyOffsetX = 4;
    /**
     * Vertical offset of the physical bounding box relative to the sprite
     */
    this.bodyOffsetY = 2;
    /**
     * Height of player when standing
     */
    this.heightStand = 14;
    /**
     * Height of player when crawling
     */
    this.heightCrawl = 6;
    /**
     * Width of player at all times
     */
    this.widthDefault = 8;
    /**
     * Maximum walking velocity on the ground
     */
    this.walkSpeedMax = 90;
    /**
     * Rate of accelleration when walking
     */
    this.walkAccel = 10;
    /**
     * Rate at which jump power builds while crouching
     */
    this.jumpPowerInc = 10;
    /**
     * Maxumim allowed jump power
     */
    this.jumpPowerMax = 180;
    /**
     * Amount by which horizontal speed increases when leaping
     */
    this.leapAccel = 40;
    /**
     * Maximum horizontal speed achieveable from leaping
     */
    this.leapMax = 120;
    /**
     * Factor by which horizontal speed is scaled while crouching or sliding
     */
    this.slideFactor = 0.97;
    /**
     * Speed under which sliding stops
     */
    this.slideBreak = 10;
    /**
     * Speed at which the player crawls
     */
    this.crawlSpeed = 30;
    
    /**
     * Facing direction (0 = left, 1 = right)
     */
    this.facing = 1; 

    /**
     * Current amount of power built up for jump
     */
    this.jumpPower = 0;

    /**
     * Whether the player is currently crawling
     */
    this.isDucking = false;

    /**
     * Whether the player is currently sliding
     */
    this.isSliding = false;
    
    /**
     * Sprite responsible for displaying the player and containing physics body
     */
    this.sprite = scene.physics.add.sprite(x, y, 'charles');
    [
      'stand',
      'walk',
      'crawl',
      'slide',
      'duck',
      'crouch',
      'fall',
      'fire',
      'jump',
    ].forEach(anim => this.sprite.anims.load(anim));
    this.sprite.body.setBounce(0);
  }
  get onFloor() {
    return this.sprite.body.onFloor();
  }
  get vx() {
    return this.sprite.body.velocity.x;
  }
  set vx(vx) {
    this.sprite.setVelocityX(vx);
  }
  get vy() {
    return this.sprite.body.velocity.y;
  }
  set vy(vy) {
    this.sprite.setVelocityY(vy);
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
      .updateSlide()
      .updateFall()
      .updateShape()
      .updateAnimation();
  }
  /**
   * @param {InputMap} inputs 
   */
  updateInput(inputs) {
    this.facing = inputs.left ? 0 : inputs.right ? 1 : this.facing;
    
    if (!this.onFloor) {
      return this;
    }
    
    if (inputs.down) {
      if (!this.isDucking && this.vx !== 0) {
        this.isSliding = true;
      }
      this.isDucking = true;
      if (this.vx === 0) {
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
        if (this.vx !== 0) {
          this.leap();
        }
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
  updateSlide() {
    if (!this.isSliding) {
      return this;
    }
    this.vx *= this.slideFactor;
    if (Math.abs(this.vx) < this.slideBreak) {
      this.isSliding = false;
      this.vx = 0;
    }
    return this;
  }
  updateFall() {
    if (this.onFloor) {
      return this;
    }
    this.jumpPower = 0;
    this.isDucking = false;
    this.isSliding = false;
    return this;
  }
  updateShape() {
    const { sprite, heightStand, heightCrawl,
      bodyOffsetX, bodyOffsetY, isDucking } = this;
    sprite.body.width = this.widthDefault;
    const correctHeight = isDucking ? heightCrawl : heightStand;
    const deltaHeight = sprite.body.height - correctHeight;
    sprite.body.height = correctHeight;
    sprite.body.setOffset(
      bodyOffsetX,
      bodyOffsetY + (isDucking ? (heightStand - heightCrawl) : 0)
    );
    return this;
  }
  updateAnimation() {
    const { sprite, vx, vy, onFloor,
      isSliding, isDucking, isCrouching, facing } = this;
    const anim =
      (onFloor) ?
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

    if (sprite.anims.currentAnim.key !== anim) {
      sprite.play(anim);
    }

    sprite.flipX = !facing;

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
    this.vy = -this.jumpPower;
    return this;
  }
  leap() {
    const { leapMax, leapAccel, facing, vx } = this;
    this.vx = (facing === 1) ?
      Math.min(leapMax, vx + leapAccel) :
      Math.max(-leapMax, vx - leapAccel);
    return this;
  }
  walkLeft() {
    this.vx = Math.max(this.vx - this.walkAccel, -this.walkSpeedMax);
    return this;
  }
  walkRight() {
    this.vx = Math.min(this.vx + this.walkAccel, this.walkSpeedMax);
    return this;
  }
  stopWalking() {
    const { walkAccel, vx } = this;
    this.isSliding = false;
    if (vx === 0) {
      return;
    }
    this.vx =
      (vx > 0) ? Math.max(vx - walkAccel, 0) : Math.min(vx + walkAccel, 0);
    return this;
  }
  crawlLeft() {
    this.vx = -this.crawlSpeed;
    return this;
  }
  crawlRight() {
    this.vx = this.crawlSpeed;
    return this;
  }
  stopCrawling() {
    this.vx = 0;
    return this;
  }
}
