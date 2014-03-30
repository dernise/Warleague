$(document).ready(function() {
  //initialise network
  window.socketClient = new Network("realmd.warleague.fr", 8080);
  //initialise UI
  window.uiManager = new WarleagueUI();
  window.game = new WarleagueGame();
});

var  b2Vec2 = Box2D.Common.Math.b2Vec2
            ,  b2AABB = Box2D.Collision.b2AABB
                ,       b2BodyDef = Box2D.Dynamics.b2BodyDef
                ,       b2Body = Box2D.Dynamics.b2Body
                ,       b2FixtureDef = Box2D.Dynamics.b2FixtureDef
                ,       b2Fixture = Box2D.Dynamics.b2Fixture
                ,       b2World = Box2D.Dynamics.b2World
                ,       b2MassData = Box2D.Collision.Shapes.b2MassData
                ,       b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
                ,       b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
                ,       b2DebugDraw = Box2D.Dynamics.b2DebugDraw
            ,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

window.requestAnimFrame = (function(){
  return window.webkitRequestAnimationFrame || 
  window.mozRequestAnimationFrame    || 
  window.oRequestAnimationFrame      || 
  window.msRequestAnimationFrame     || 
  function(/* function */ callback, /* DOMElement */ element){
    window.setTimeout(callback, 1000 / 60);};
  })();

/*
 * On resize, correct de height of the chat and width of the navbar
 */
$( window ).resize(function() { //Resize chat
  window.uiManager.updateSizes();
});

var WarleagueGame = function(){
  var that = this;

  var MAP      = { tw: 64, th: 48 },
      TILE     = 30,
      KEY      = { SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 },
      METER    = TILE,
      GRAVITY  = METER * 9.8 * 6, // exagerated gravity
      MAXDX    = METER * 20,      // max horizontal speed (20 tiles per second)
      MAXDY    = METER * 60,      // max vertical speed (60 tiles per second)
      ACCEL    = MAXDX * 2,       // take 1/2 second to reach maxdx     (horizontal acceleration)
      FRICTION = MAXDX * 6,       // take 1/6 second to stop from maxdx (horizontal friction)
      JUMP     = METER * 1500,    // (big) instantaneous jump impulse
      COLOR  = { BLACK: '#000000', YELLOW: '#ECD078', BRICK: '#D95B43', PINK: '#C02942', PURPLE: '#542437', GREY: '#333', SLATE: '#53777A' },
      COLORS = [ COLOR.BLACK, COLOR.YELLOW, COLOR.BRICK, COLOR.PINK, COLOR.PURPLE, COLOR.GREY ];
      
  var fps = 60,
      step = 1/fps,
      canvas   = document.getElementById('game'),
      ctx      = canvas.getContext('2d'),
      width    = canvas.width  = MAP.tw * TILE,
      height   = canvas.height = MAP.th * TILE,
      player   = {},
      cells    = [];

  var t2p = function(t) { return t*TILE;             },
      p2t = function(p) { return Math.floor(p/TILE); },
      cell     = function(x,y)   { return tcell(t2p(x),t2p(y));    }, 
      tcell    = function(tx,ty) { return cells[tx + (ty*MAP.tw)]; };

  var counter = 0, dt = 0, now,
      last = timestamp();

  /*
   * Returns the current date
   */ 
  function timestamp() {
    if (window.performance && window.performance.now)
      return window.performance.now();
    else
      return new Date().getTime();
  }      

  var createWorld = function() {
    world = new b2World(
      new b2Vec2(0, 25)    //gravity
      ,  true                 //allow sleep
    );
    return world;
  }

  this.onKey = function(ev, key, down){
    switch(key) {
      case KEY.LEFT:  this.player.do_move_left  = down; return false;
      case KEY.RIGHT: this.player.do_move_right = down; return false;
      case KEY.UP: this.player.do_jump = down; return false;
    }    
  };  

  this.startGame = function() {
    ctx.clearRect(0, 0, width, height);
    $(document).on('keydown', function(ev) { return that.onKey(ev, ev.keyCode, true);  }); //On keydown
    $(document).on('keyup', function(ev) { return that.onKey(ev, ev.keyCode, false);  }); // On keyUp
    this.loadMap(level1); // Loads the map
    that.player = new Player({x : 15, y: 15 , game : this}); //Create a player
    this.renderMap(ctx); // Renders the map

    window.requestAnimFrame(updateFrame);
  };

  /*
   *  Renders the Map
   */
  this.renderMap = function(ctx) {
    var x, y, cell;
    for(y = 0 ; y < MAP.th ; y++) {
      for(x = 0 ; x < MAP.tw ; x++) {
        cell = tcell(x, y);
        if (cell) {
          ctx.fillStyle = COLORS[tcell(x,y)];
          ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
        }
      }
    }
  };

  this.renderPlayer = function(ctx, dt){
    ctx.fillStyle = COLOR.YELLOW;
    ctx.fillRect(that.player.x + (that.player.dx * dt), that.player.y + (that.player.dy * dt), TILE, TILE);    
  };

  this.loadMap = function(map) {
    var data = map.layers[0].data;
    cells = data;
  };

  /*
   * Updates the physic 
   */
  var update = function(step){
    that.player.tick(step);
  }

  var updateFrame = function(){
    ctx.clearRect(0, 0, width, height);
    now = timestamp();
    dt = dt + Math.min(1, (now - last) / 1000);
    while(dt > step) {
      dt = dt - step;
      update(step);
    }
    console.log(that.player.ddx);
    that.renderMap(ctx);
    that.renderPlayer(ctx, dt);
    last = now;
    window.requestAnimFrame(updateFrame);
  };

  /*
   *
   *  Player class, contains every controls
   *  and players' informations
   *
   */ 

  var Player = function(options){
    this.x = options.x;
    this.y = options.y;
    this.dx = 0;
    this.dy = 0;
    this.falling = false;
    this.game = options.game;
    this.do_move_left = false;
    this.do_move_right = false;
    this.do_jump = false;
    this.can_jump = true;
    this.max_hor_vel = 15;
    this.max_ver_vel = 15;

    
    /*
     * Update player movements
     */
    this.tick = function(dt){
      var wasleft  = this.dx < 0,
          wasright = this.dx > 0,
          falling    = this.falling,
          friction   = FRICTION * (falling ? 0.5 : 1),
          accel      = ACCEL * (falling ? 0.5 : 1);

      this.ddx = 0;
      this.ddy = GRAVITY;

      if(this.do_move_left)
        this.ddx = this.ddx - accel;
      else if(wasleft)
        this.ddx = this.ddx + friction; 

      if (this.do_move_right)
        this.ddx =  this.ddx + accel;     // player wants to go right
      else if (wasright)
        this.ddx =  this.ddx - friction; 

      if (this.do_jump && !this.jumping && !falling) {
        this.ddy = this.ddy - JUMP; // an instant big force impulse
        this.jumping = true;
      }

      this.y  = Math.floor(this.y  + (dt * this.dy));
      this.x  = Math.floor(this.x  + (dt * this.dx));
      this.dy = Math.max(-MAXDX, Math.min(MAXDX, this.dy + (dt * this.ddy)));
      this.dx = Math.max(-MAXDX, Math.min(MAXDX, this.dx + (dt * this.ddx)));

      if ((wasleft  && (that.player.dx > 0)) || (wasright && (that.player.dx < 0))) {
          that.player.dx = 0; 
      }

      var tx      = p2t(this.x),
        ty        = p2t(this.y),
        nx        = this.x%TILE,
        ny        = this.y%TILE,
        cell      = tcell(tx,     ty),
        cellright = tcell(tx + 1, ty),
        celldown  = tcell(tx,     ty + 1),
        celldiag  = tcell(tx + 1, ty + 1);

      if (this.dy > 0) {
        if ((celldown && !cell) ||
            (celldiag && !cellright && nx)) {
          this.y = t2p(ty);
          this.dy = 0;
          this.falling = false;
          this.jumping = false;
          ny = 0;
        }
      }

      else if (this.dy < 0) {
        if ((cell      && !celldown) ||
            (cellright && !celldiag && nx)) {
          this.y = t2p(ty + 1);
          this.dy = 0;
          cell      = celldown;
          cellright = celldiag;
          ny        = 0;
        }
      }

      if (this.dx > 0) {
        if ((cellright && !cell) ||
            (celldiag  && !celldown && ny)) {
          this.x = t2p(tx);
          this.dx = 0;
        }
      }
      else if (this.dx < 0) {
        if ((cell     && !cellright) ||
            (celldown && !celldiag && ny)) {
          this.x = t2p(tx + 1);
          this.dx = 0;
        }
      }

      this.falling = ! (celldown || (nx && celldiag));
    };
  };
};

