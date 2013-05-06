var Explosion = me.ObjectEntity.extend({

  init: function(x, y, settings) {
    settings.image = "Explosion";
    settings.spritewidth = 45;
    settings.spriteheight = 45;
    this.parent(x, y, settings);
    this.addAnimation("default", [0, 1, 2, 3, 4]);
    this.setCurrentAnimation("default");
  },

  update: function() {
    this.visible = true;
    this.parent(this);
    return true;
  }

});