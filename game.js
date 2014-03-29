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
  return function(/* function */ callback, /* DOMElement */ element){
           window.setTimeout(callback, 1000 / 30);};
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
      GRAVITY = 9.8 * 6, // default (exagerated) gravity
      MAXDX = 15, // default max horizontal speed (15 tiles per second)
      MAXDY = 60, // default max vertical speed (60 tiles per second)
      ACCEL = 1/2, // default take 1/2 second to reach maxdx (horizontal acceleration)
      FRICTION = 1/6, // default take 1/6 second to stop from maxdx (horizontal friction)
      IMPULSE = 1500, // default player jump impulse      
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

  var createWorld = function() {
    world = new b2World(
      new b2Vec2(0, 25)    //gravity
      ,  true                 //allow sleep
    );
    return world;
  }

  this.onKey = function(ev, key, down){
    this.player.body.SetAwake(true);
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

    window.requestAnimFrame(update);
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

  this.loadMap = function(map) {
    var data = map.layers[0].data;
    cells = data;
  };

  var update = function(){
    that.renderMap(ctx);
    that.player.tick();
    window.requestAnimFrame(update);
  };
};

var Player = function(options){
  this.x = options.x;
  this.y = options.y;
  this.height = 2;
  this.width = 1;
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
  this.tick = function(){
    if(this.do_move_left)
    {
      this.add_velocity(new b2Vec2(-2,0));
    }
    
    if(this.do_move_right)
    {
      this.add_velocity(new b2Vec2(2,0));
    }

    if(Math.abs(this.body.GetLinearVelocity().y) == 0.0)
    {
      this.can_jump = true;
    }

    if(this.do_jump && this.can_jump){
      currVell = Math.abs(this.body.GetLinearVelocity().y);
      
      if(currVell > 0.0)
        this.add_velocity(new b2Vec2(0,-currVell));
      
      this.add_velocity(new b2Vec2(0,-12));
      this.can_jump = false;
    }
  };
  
  this.add_velocity = function(vel)
  {
    var b = this.body;
    var v = b.GetLinearVelocity();
    
    v.Add(vel);
    
    //check for max horizontal and vertical velocities and then set
    if(Math.abs(v.y) > this.max_ver_vel)
    {
      v.y = this.max_ver_vel * v.y/Math.abs(v.y);
    }
    
    if(Math.abs(v.x) > this.max_hor_vel)
    {
      v.x = this.max_hor_vel * v.x/Math.abs(v.x);
    }

    //set the new velocity
    b.SetLinearVelocity(v);
  }
};