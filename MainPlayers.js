/*-------------------
 a player entity
 -------------------------------- */
var Player = me.ObjectEntity.extend({
    /* -----
     constructor
     ------ */
    init: function (x, y, settings) {
        // call the constructor
        this.parent(x, y, settings);
        // make it collidable
        this.collidable = true;
        this.type = me.game.ENEMY_OBJECT;
        //this.addAnimation ("explosion", [0,1,2]);
    },
    onCollision: function (res, obj) {
        //console.log(obj.type);
        //console.log(me.game.ENEMY_OBJECT);
        // if we collide with an enemy
        if (obj.type == me.game.ACTION_OBJECT) {
            //this.flicker(4);
            this.setOpacity(0.7);
            // make sure it cannot be collidable "again"
            //this.collidable = false;
        }
        //if (obj.type == me.game.ACTION_OBJECT) {
        //    //this.flicker(45);
        //}
    }
});


var Gorilla = Player.extend({
    /* -----
     constructor
     ------ */
    init: function (x, y, settings) {
        // call the constructor
        //those settings we could also save in the .tmx file for every entity
        settings.image = "Gorilla";
        settings.spritewidth = 32;
        settings.spriteheight = 32;

        this.parent(x, y, settings);

        this.setTransparency("#78C380");
        this.updateColRect(0, 32, 18, 15); //set specific collision box
        //define the positions for the specific animation in the spritesheet
        this.addAnimation("walkDown", [0, 1, 2]);
        this.addAnimation("walkLeft", [3, 4, 5]);
        this.addAnimation("walkRight", [6, 7, 8]);
        this.addAnimation("walkUp", [9, 10, 11]);
        this.setCurrentAnimation("walkDown");
        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(3, 3);
        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
        this.shootReady = true;
    },
    shoot: function () {
        var posX = this.pos.x;
        var posY = this.pos.y;

        if (this.shootReady === true) {
            clearTimeout(this.timeout);
            var widthOffset = this.width;
            var heightOffset = this.height;
            if (this.vel.x !== 0 || this.vel.y !== 0) {//if object moving set another Offset
                widthOffset += this.accel.x * 2;//dependency of player moving speed in x-direction
                heightOffset += this.accel.y * 2;//dependency of player moving speed in y-direction
            }
            switch (this.current.name) {//name of the animation
                case 'walkLeft':
                    posX = this.pos.x - widthOffset;
                    break;
                case 'walkRight':
                    posX = this.pos.x + widthOffset;
                    break;
                case 'walkUp':
                    posY = this.pos.y - heightOffset;
                    break;
                case 'walkDown':
                    posY = this.pos.y + heightOffset;
            }
            var shot = new Melon(posX, posY, this.current.name, {image: "GreenCoconut", spritewidth: 32, spriteheight: 32});
            me.game.add(shot, this.z + 1); //bullet should appear 1 layer before the mainPlayer
            me.game.sort();
            this.shootReady = false;
            //var myPlayer = this;
            //console.log(this);
            this.timeout = setTimeout(function () {
                //console.log("shootReady Gorilla");
                this.shootReady = true;
               //console.log(this);
            }.bind(this), 400);

        }
    },
    /* -----
     update the player pos
     ------ */
    update: function () {

        if (me.input.isKeyPressed('left')) {
            this.setCurrentAnimation("walkLeft");
            if (me.input.isKeyPressed('down')) {
                this.vel.y += this.accel.y * me.timer.tick;
            } else if (me.input.isKeyPressed('up')) {
                this.vel.y -= this.accel.y * me.timer.tick;
            } else {
                this.vel.y = 0;
            }
            // update the entity velocity
            this.vel.x -= this.accel.x * me.timer.tick;
        } else if (me.input.isKeyPressed('right')) {
            this.setCurrentAnimation("walkRight");
            if (me.input.isKeyPressed('down')) {
                this.vel.y += this.accel.y * me.timer.tick;
            } else if (me.input.isKeyPressed('up')) {
                this.vel.y -= this.accel.y * me.timer.tick;
            } else {
                this.vel.y = 0;
            }
            // update the entity velocity
            this.vel.x += this.accel.x * me.timer.tick;
        } else if (me.input.isKeyPressed('up')) {
            this.setCurrentAnimation("walkUp");
            if (!me.input.isKeyPressed('right') || (me.input.isKeyPressed('left'))) {
                this.vel.x = 0;
            }
            // update the entity velocity
            this.vel.y -= this.accel.y * me.timer.tick;
        }
        else if (me.input.isKeyPressed('down')) {
            this.setCurrentAnimation("walkDown");
            if (!me.input.isKeyPressed('right') || (me.input.isKeyPressed('left'))) {
                this.vel.x = 0;
            }
            // update the entity velocity
            this.vel.y += this.accel.y * me.timer.tick;
        }
        else {
            //reset the current animation to the first frame
            this.vel.x = 0;
            this.vel.y = 0;
            this.setAnimationFrame(1); //render the standing frame of every Animation if no key input action
        }

        if (me.input.isKeyPressed('shootLeft')) {
            this.setCurrentAnimation("walkLeft");
            this.shoot();
        }
        if (me.input.isKeyPressed('shootRight')) {
            this.setCurrentAnimation("walkRight");
            this.shoot();
        }
        if (me.input.isKeyPressed('shootUp')) {
            this.setCurrentAnimation("walkUp");
            this.shoot();
        }
        if (me.input.isKeyPressed('shootDown')) {
            this.setCurrentAnimation("walkDown");
            this.shoot();
        }
        /*if (me.input.isKeyPressed('jump')) {
         // make sure we are not already jumping or falling
         if (!this.jumping && !this.falling) {
         // set current vel to the maximum defined value
         // gravity will then do the rest
         this.vel.y = -this.maxVel.y * me.timer.tick;
         // set the jumping flag
         this.jumping = true;
         }
         }*/
        // check & update player movement
        this.updateMovement();
        var collided = me.game.collide(this);

        if (collided) {
            var that = this;
            // if we collide with an enemy
            if (collided.obj.type == me.game.ENEMY_OBJECT) {
                // let's flicker in case we touched an enemy
                //this.flicker(45);
                this.setOpacity(0.5);
                setTimeout(function () {
                    that.setOpacity(1);
                }, 50);
            }
            if (collided.obj.type == me.game.ACTION_OBJECT) {
                // let's flicker in case we touched an enemy
                //this.flicker(45);
                this.setOpacity(0.3);
                setTimeout(function () {
                    that.setOpacity(1);
                }, 2000);
            }
        }
        // update animation if necessary
        if (this.vel.x !== 0 || this.vel.y !== 0) {
            // update object animation
            this.parent();
            return true;
        }
        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return false;
    }
});

var Military = Player.extend({
    /* -----
     constructor
     ------ */
    init: function (x, y, settings) {
        // call the constructor
        settings.image = "Military";
        settings.spritewidth = 32;
        settings.spriteheight = 32;

        this.parent(x, y, settings);

        this.setTransparency("#78C380");
        this.updateColRect(0, 32, 18, 15); //set specific collision box
        //define the positions for the specific animation in the spritesheet
        this.addAnimation("walkDown2", [3, 4, 5]);
        this.addAnimation("walkLeft2", [15, 16, 17]);
        this.addAnimation("walkRight2", [27, 28, 29]);
        this.addAnimation("walkUp2", [39, 40, 41]);
        this.setCurrentAnimation("walkDown2");
        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(3, 3);
        // set the display to follow our position on both axis
        //me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
        this.shootReady = true;
    },
    shoot: function () {
        var posX = this.pos.x;
        var posY = this.pos.y;
        if (this.shootReady === true) {
            clearTimeout(this.timeout);
            var widthOffset = this.width;
            var heightOffset = this.height;
            if (this.vel.x !== 0 || this.vel.y !== 0) {//if object moving set another Offset
                widthOffset += this.accel.x * 2;//dependency of player moving speed in x-direction
                heightOffset += this.accel.y * 2;//dependency of player moving speed in y-direction
            }
            switch (this.current.name) {//name of the animation
                case 'walkLeft2':
                    posX = this.pos.x - widthOffset;
                    break;
                case 'walkRight2':
                    posX = this.pos.x + widthOffset;
                    break;
                case 'walkUp2':
                    posY = this.pos.y - heightOffset;
                    break;
                case 'walkDown2':
                    posY = this.pos.y + heightOffset;
            }
            var shot = new Melon(posX, posY, this.current.name, {image: "Waterbomb", spritewidth: 32, spriteheight: 32});
            me.game.add(shot, this.z + 1); //bullet should appear 1 layer before the mainPlayer
            me.game.sort();
            this.shootReady = false;
            //var myPlayer = this;
            this.timeout = setTimeout(function () {
                //console.log("ShootReady Military");
                // myPlayer.shootReady = true;
                this.shootReady = true;
            }.bind(this), 400);
        }
    },
    /* -----
     update the player pos
     ------ */
    update: function () {
        if (me.input.isKeyPressed('left2')) {
            this.setCurrentAnimation("walkLeft2");
            if (me.input.isKeyPressed('down2')) {
                this.vel.y += this.accel.y * me.timer.tick;
            } else if (me.input.isKeyPressed('up2')) {
                this.vel.y -= this.accel.y * me.timer.tick;
            } else {
                this.vel.y = 0;
            }
            // update the entity velocity
            this.vel.x -= this.accel.x * me.timer.tick;
        } else if (me.input.isKeyPressed('right2')) {
            this.setCurrentAnimation("walkRight2");
            if (me.input.isKeyPressed('down2')) {
                this.vel.y += this.accel.y * me.timer.tick;
            } else if (me.input.isKeyPressed('up2')) {
                this.vel.y -= this.accel.y * me.timer.tick;
            } else {
                this.vel.y = 0;
            }
            // update the entity velocity
            this.vel.x += this.accel.x * me.timer.tick;
        } else if (me.input.isKeyPressed('up2')) {
            this.setCurrentAnimation("walkUp2");
            if (!me.input.isKeyPressed('right2') || (me.input.isKeyPressed('left2'))) {
                this.vel.x = 0;
            }
            // update the entity velocity
            this.vel.y -= this.accel.y * me.timer.tick;
        }
        else if (me.input.isKeyPressed('down2')) {
            this.setCurrentAnimation("walkDown2");
            if (!me.input.isKeyPressed('right2') || (me.input.isKeyPressed('left2'))) {
                this.vel.x = 0;
            }
            // update the entity velocity
            this.vel.y += this.accel.y * me.timer.tick;
        }
        else {
            //reset the current animation to the first frame
            this.vel.x = 0;
            this.vel.y = 0;
            this.setAnimationFrame(1); //render the standing frame of every Animation if no key input action
        }

        if (me.input.isKeyPressed('shootLeft2')) {
            this.setCurrentAnimation("walkLeft2");
            this.shoot();
        }
        if (me.input.isKeyPressed('shootRight2')) {
            this.setCurrentAnimation("walkRight2");
            this.shoot();
        }
        if (me.input.isKeyPressed('shootUp2')) {
            this.setCurrentAnimation("walkUp2");
            this.shoot();
        }
        if (me.input.isKeyPressed('shootDown2')) {
            this.setCurrentAnimation("walkDown2");
            this.shoot();
        }
        /*if (me.input.isKeyPressed('jump')) {
         // make sure we are not already jumping or falling
         if (!this.jumping && !this.falling) {
         // set current vel to the maximum defined value
         // gravity will then do the rest
         this.vel.y = -this.maxVel.y * me.timer.tick;
         // set the jumping flag
         this.jumping = true;
         }
         }*/
        // check & update player movement
        this.updateMovement();
        var collided = me.game.collide(this);

        if (collided) {
            var that = this;
            // if we collide with an enemy
            if (collided.obj.type == me.game.ENEMY_OBJECT) {
                // let's flicker in case we touched an enemy
                //this.flicker(45);
                this.setOpacity(0.5);
                setTimeout(function () {
                    that.setOpacity(1);
                }, 50);
            }
            if (collided.obj.type == me.game.ACTION_OBJECT) {
                // let's flicker in case we touched an enemy
                //this.flicker(45);
                this.setOpacity(0.3);
                setTimeout(function () {
                    that.setOpacity(1);
                }, 2000);
            }
        }
        // update animation if necessary
        if (this.vel.x !== 0 || this.vel.y !== 0) {
            // update object animation
            this.parent();
            return true;
        }
        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return false;
    }
});