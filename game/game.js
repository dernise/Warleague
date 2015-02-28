$(document).ready(function() {
  //initialise network
  window.socketClient = new Network("localhost", 3000);
  //initialise UI
  window.uiManager = new WarleagueUI();
  window.game = new WarleagueGame();
});

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

document.oncontextmenu =function( evt ){
        return false;
}

var WarleagueGame = function(){
  $.extend( true, this, WarleagueGlobals ); //Implementing globals
  var that = this;

  var LASTPOSX = 0,
      LASTPOSY = 0;

  var fps = 60,
      step = 1/fps,
      canvas   = document.getElementById('game'),
      ctx      = canvas.getContext('2d'),
      width    = canvas.width  = that.MAP.tw * that.TILE,
      height   = canvas.height = that.MAP.th * that.TILE,
      player   = {},
      cells    = [],
      players  = [];

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

  this.onKey = function(ev, key, down){
    switch(key) {
      case that.KEY.LEFT: 
        this.player.do_move_left  = down; 
        return false;
      case that.KEY.RIGHT: 
        this.player.do_move_right = down; 
        return false;
      case that.KEY.UP: 
        this.player.do_jump = down; 
        return false;
    }    
  };  

  this.addPlayer = function(id, name)
  {
    var player = new this.Player({x : 15, y: 15 , game : this, username : name, id : id}, that);
    players.push(player);
  }

  this.updatePos = function(id, posx, posy)
  {
    for (var i = 0; i < players.length; i++) {
      if(players[i].id == id)
      {
        players[i].x = posx;
        players[i].y = posy;
      }
    }
  }

  this.startGame = function() {
    ctx.clearRect(0, 0, width, height);
    $(document).on('keydown', function(ev) { return that.onKey(ev, ev.keyCode, true);  }); //On keydown
    $(document).on('keyup', function(ev) { return that.onKey(ev, ev.keyCode, false);  }); // On keyUp
    this.loadMap(level1); // Loads the map
    that.player = new this.Player({x : 15, y: 15 , game : this, username : that.pseudo, id : 0}, that); //Create a player
    this.renderMap(ctx); // Renders the map
    window.requestAnimFrame(updateFrame);
  };

  this.setPseudo = function(pseudo) {
    that.pseudo = pseudo;
  }

  /*
   *  Renders the Map
   */
  this.renderMap = function(ctx) {
    var x, y, cell;
    for(y = 0 ; y < that.MAP.th ; y++) {
      for(x = 0 ; x < that.MAP.tw ; x++) {
        cell = that.tcell(x, y);
        if (cell) {
          ctx.fillStyle = that.COLORS[that.tcell(x,y)];
          ctx.fillRect(x * that.TILE, y * that.TILE, that.TILE, that.TILE);
        }
      }
    }
  };

  /**
   * Render the players
   */
  this.renderPlayers = function(ctx)
  {
    for (var i = 0; i < players.length; i++) {
      ctx.fillStyle = that.COLOR.YELLOW;
      ctx.fillRect(players[i].x, players[i].y, that.TILE, that.TILE);    
      ctx.fillStyle = "white";
      ctx.font = "bold 24px Arial";
      var metrics = ctx.measureText(players[i].username);
      ctx.fillText(players[i].username, players[i].x - ((metrics.width - 30) / 2), players[i].y - 20);
    }  
  }

  /**
   * Render the controller
   */
  this.renderPlayer = function(ctx, dt){
    ctx.fillStyle = that.COLOR.YELLOW;
    ctx.fillRect(that.player.x + (that.player.dx * dt), that.player.y + (that.player.dy * dt), that.TILE, that.TILE);    
    ctx.fillStyle = "white";
    ctx.font = "bold 24px Arial";
    var metrics = ctx.measureText(that.pseudo);
    ctx.fillText(that.pseudo, that.player.x + (that.player.dx * dt) - ((metrics.width - 30) / 2), that.player.y + (that.player.dy * dt) - 20);

    if(LASTPOSX != that.player.x + (that.player.dx * dt) || LASTPOSY != that.player.y + (that.player.dy * dt))
    {
      LASTPOSX = that.player.x + (that.player.dx * dt);
      LASTPOSY = that.player.y + (that.player.dy * dt);
      socketClient.sendPosition(LASTPOSX, LASTPOSY);
    }
  };

  this.loadMap = function(map) {
    var data = map.layers[0].data;
    that.cells = data;
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
    that.renderMap(ctx);
    that.renderPlayer(ctx, dt);
    that.renderPlayers(ctx);
    last = now;
    window.requestAnimFrame(updateFrame);
  };
};
