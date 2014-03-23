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
  return  window.requestAnimationFrame       || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame    || 
    window.oRequestAnimationFrame      || 
    window.msRequestAnimationFrame     || 
    function(/* function */ callback, /* DOMElement */ element){
      window.setTimeout(callback, 1000 / 60);
    };
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
      KEY      = { SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 };
      
  var canvas   = document.getElementById('game'),
      ctx      = canvas.getContext('2d'),
      width    = canvas.width  = MAP.tw * TILE,
      height   = canvas.height = MAP.th * TILE,
      player   = {},
      cells    = [];

  var cell     = function(x,y)   { return tcell(x,y);    }, 
      tcell    = function(tx,ty) { return cells[tx + (ty*MAP.tw)]; };

  var createWorld = function() {
    world = new b2World(
      new b2Vec2(0, 20)    //gravity
      ,  true                 //allow sleep
    );
    return world;
  }

  this.onKey = function(ev, key, down){
    this.player.body.SetAwake(true);
    switch(key) {
      case KEY.LEFT:  this.player.do_move_left  = down; return false;
      case KEY.RIGHT: this.player.do_move_right = down; return false;
      //case KEY.SPACE: this.player.jump  = down; return false;
    }    
  };  

  this.startGame = function() {
    ctx.clearRect(0, 0, width, height);
    $(document).on('keydown', function(ev) { return that.onKey(ev, ev.keyCode, true);  });
    $(document).on('keyup', function(ev) { return that.onKey(ev, ev.keyCode, false);  });
    this.world = createWorld(); //Creates the world object
    this.loadMap(level1); // Loads the map
    that.player = new Player({x : 15, y: 15 , game : this}); //Create a player
    this.renderMap(ctx); // Renders the map

    /*
     *  Renders the frames
     */
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(ctx);
    debugDraw.SetDrawScale(30);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);
    window.requestAnimFrame(update);
  };

  /*
   *  Renders the Map
   */
  this.renderMap = function(ctx) {
    var x, y, cell;
    var fixDef = new b2FixtureDef;
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;
    var bodyDef = new b2BodyDef;
    for(y = 0 ; y < MAP.th ; y++) {
      for(x = 0 ; x < MAP.tw ; x++) {
        cell = tcell(x, y);
        if (cell) {
          bodyDef.type = b2Body.b2_staticBody;
          bodyDef.position.x = x;
          bodyDef.position.y = y;
          fixDef.shape = new b2PolygonShape;
          fixDef.shape.SetAsBox(1, 1);
          this.world.CreateBody(bodyDef).CreateFixture(fixDef);
        }
      }
    }
  };

  this.loadMap = function(map) {
    var data = map.layers[0].data;
    cells = data;
  };

  var update = function(){
    this.world.Step(
         1 / 60   //frame-rate
      ,  8      //velocity iterations
      ,  3      //position iterations
    );
    that.player.tick();
    this.world.DrawDebugData();
    this.world.ClearForces();
    window.requestAnimFrame(update);
  }
};

var Player = function(options){
  this.x = options.x;
  this.y = options.y;
  this.height = 2;
  this.width = 1;
  this.game = options.game;
  this.do_move_left = false;
  this.do_move_right = false;
  this.max_hor_vel = 10;
  this,max_ver_vel = 20;
  var info = { 
    'density' : 10 ,
    'fixedRotation' : true ,
    'userData' : this ,
    'type' : b2Body.b2_dynamicBody ,
    'restitution' : 0.0 ,
  };
  this.body = create_sphere(this.game.world , this.x, this.y, this.width, this.height, info);

  this.tick = function(){
    if(this.do_move_left)
    {
      this.add_velocity(new b2Vec2(-10,0));
    }
    
    if(this.do_move_right)
    {
      this.add_velocity(new b2Vec2(10,0));
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