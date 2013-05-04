/* --------------------------
an enemy Entity
------------------------ */
var Enemy = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // define this here instead of tiled
        settings.image = "Enemy";
        settings.spritewidth = 64;
        settings.spriteheight = 64;
 
        // call the parent constructor
        this.parent(x, y, settings);
 
        this.startX = x;
        this.endX = x + settings.width - settings.spritewidth;
        // size of sprite
 
        // make him start from the right
        this.pos.x = x + settings.width - settings.spritewidth;
        this.walkLeft = true;
 
        // walking & jumping speed
        this.setVelocity(4, 6);
 
        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;

        this.walkedLeft = true;

 
    },
 
    // call by the engine when colliding with another object
    // obj parameter corresponds to the other object (typically the player) touching this one
    onCollision: function(res, obj) {
        this.flicker(45);
        this.alive = false;
        me.game.remove(this, true); //removing an object and force immidiate deletion with true
    },
    
    // manage the enemy movement
    update: function() {
        // do nothing if not visible
        if (!this.visible)
            return false;

        if (this.alive) {
            if (this.walkLeft && this.pos.x <= this.startX) {
                this.walkLeft = false;
            } else if (!this.walkLeft && this.pos.x >= this.endX) {
                this.walkLeft = true;
            }
            // make it walk
            if (this.walkLeft != this.walkedLeft){
                this.flipX(this.walkLeft);
                this.walkedLeft = this.walkLeft;
            }
            this.vel.x += (this.walkLeft) ? -this.accel.x * me.timer.tick : this.accel.x * me.timer.tick;
                 
        } else {
            this.vel.x = 0;
        }
        
        // check and update movement
        this.updateMovement();
         
        // update animation if necessary
        if (this.vel.x!==0 || this.vel.y!==0) {
            // update object animation
            this.parent();
            return true;
        }

        return false;
    }
});