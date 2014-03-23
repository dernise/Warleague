$(document).ready(function() {
  //initialise network
  window.socketClient = new Network("realmd.warleague.fr", 8080);
  //initialise UI
  window.uiManager = new WarleagueUI();
  window.game = new WarleagueGame();
});

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
  var   b2Vec2 = Box2D.Common.Math.b2Vec2
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
              
  var MAP      = { tw: 64, th: 48 },
      TILE     = 30,
      KEY      = { SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 },
      WORLD;
      
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
      new b2Vec2(0, 10)    //gravity
      ,  true                 //allow sleep
    );
    return world;
  }

  this.render = function() {
    ctx.clearRect(0, 0, width, height);
    WORLD = createWorld();
    this.setup(level1);
    this.renderMap(ctx);
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(ctx);
    debugDraw.SetDrawScale(30);
    debugDraw.SetFillAlpha(0.3);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    WORLD.SetDebugDraw(debugDraw);
    window.requestAnimFrame(update);
  }

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
          WORLD.CreateBody(bodyDef).CreateFixture(fixDef);
        }
      }
    }
    bodyDef.type = b2Body.b2_dynamicBody;
    fixDef.shape = new b2PolygonShape;
    fixDef.shape.SetAsBox(1,1);
    bodyDef.position.x = 15;
    bodyDef.position.y = 15;
    WORLD.CreateBody(bodyDef).CreateFixture(fixDef);
  } 

  this.setup = function(map) {
    var data = map.layers[0].data;
    cells = data;
  }

  var update = function(){
    WORLD.Step(
         1 / 60   //frame-rate
      ,  10       //velocity iterations
      ,  10       //position iterations
    );
    WORLD.DrawDebugData();
    WORLD.ClearForces();
    window.requestAnimFrame(update);
  }
}