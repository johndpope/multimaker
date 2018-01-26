import Phaser from 'phaser';
import Actor from './actor';

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
export default class Player extends Actor {
  /**
   * @prop {number} bodyOffsetX Horizontal offset of the physical bounding box relative to the sprite
   */
  
  /**
   * @prop {number} bodyOffsetY Vertical offset of the physical bounding box relative to the sprite
   */
  
  /**
   * @prop {number} heightStand of player when standing
   */
  
  /**
   * @prop {number} heightCrawl of player when crawling
   */
  
  /**
   * @prop {number} widthDefault player at all times
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
   * @orop {boolean} prevOnFloor Whether player was on the floor in the previous frame
   */

  get defaults() {
    return {
      bodyOffsetX: 4,
      bodyOffsetY: 2,
      crawlSpeed: 30,
      facing: 1,
      heightCrawl: 6,
      heightStand: 14,
      isDucking: false,
      isSliding: false,
      jumpPower: 0,
      jumpPowerInc: 8,
      jumpPowerMax: 180,
      leapAccel: 40,
      leapMax: 120,
      slideBreak: 10,
      slideFactor: 0.97,
      walkAccel: 10,
      walkSpeedMax: 90,
      widthDefault: 8,
      prevOnFloor: false
    };
  }

  /**
   * @param {Phaser.Scene} scene
   * @param {number} x 
   * @param {number} y 
   * @return {Phaser.GameObject[]}
   */
  setupGameObjects(scene, x, y) {
    const main = scene.physics.add.sprite(x, y, 'charles');
    main.body.setBounce(0);
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
    ].forEach(anim => main.anims.load(anim));

    // Register event handlers to play the footstep sounds
    const walk = main.anims.animationManager.get('walk');
    walk.onUpdate = () => {
      const sound = main.anims.currentFrame.frame.customData.sound;
      if (sound) {
        scene.sound.play(sound);
      }
    }
    
    return [main];
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
      if (!this.prevOnFloor) {
        this.scene.sound.play('land');
      }
      this.prevOnFloor = true;
      return this;
    }
    this.prevOnFloor = false;
    this.jumpPower = 0;
    this.isDucking = false;
    this.isSliding = false;
    return this;
  }
  updateShape() {
    const { gameObject: gobj, heightStand, heightCrawl,
      bodyOffsetX, bodyOffsetY, isDucking } = this;
    gobj.body.width = this.widthDefault;
    const correctHeight = isDucking ? heightCrawl : heightStand;
    const deltaHeight = gobj.body.height - correctHeight;
    gobj.body.height = correctHeight;
    gobj.body.setOffset(
      bodyOffsetX,
      bodyOffsetY + (isDucking ? (heightStand - heightCrawl) : 0)
    );
    return this;
  }
  updateAnimation() {
    const { gameObject: gobj, vx, vy, onFloor,
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

    if (gobj.anims.currentAnim.key !== anim) {
      gobj.play(anim);
    }

    gobj.flipX = !facing;

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
    this.scene.sound.play('jump');
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
