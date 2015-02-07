var viewWidth = 1280;
var viewHeight = 720;
var world = Physics();

  var renderer = Physics.renderer('canvas', {
    el: 'viewport',
    width: viewWidth,
    height: viewHeight,
    meta: false, // don't display meta data
    styles: {
        // set colors for the circle bodies
        'circle' : {
            strokeStyle: '#351024',
            lineWidth: 1,
            fillStyle: '#d33682',
            angleIndicator: '#351024'
        }
    }
  });

  // add the renderer
  world.add( renderer );
  // render on each step
  world.on('step', function(){
    world.render();
  });

  // bounds of the window
  var viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight);

  // constrain objects to these bounds
  world.add(Physics.behavior('edge-collision-detection', {
      aabb: viewportBounds,
      restitution: 0.99,
      cof: 0.99
  }));


  // ensure objects bounce when edge collision is detected
  world.add( Physics.behavior('body-impulse-response') );

  // add some gravity
  world.add( Physics.behavior('constant-acceleration') );

  // subscribe to ticker to advance the simulation
  Physics.util.ticker.on(function( time, dt ){

      world.step( time );
  });

  // start the ticker
  Physics.util.ticker.start();

var canvas = document.getElementsByTagName("canvas");

canvas[0].setAttribute("height", viewHeight);
canvas[0].setAttribute("width", viewWidth);

	var caca =Physics.body('circle', {
        x: 50, // x-coordinate
        y: 30, // y-coordinate
        vx: 0, // velocity in x-direction
        vy: 0, // velocity in y-direction
        radius: 20
      })
	world.add( caca );

console.log(caca);

document.onkeydown = function(touche){
	    switch (touche.keyCode) {
        case 37:
            if(caca.state.vel.x != -1)caca.state.vel.x += -0.1;
            break;
        case 38:
            if(caca.state.vel.y != -1) caca.state.vel.y += -0.1;
            break;
        case 39:
            if(caca.state.vel.x != 1)caca.state.vel.x += 0.1;
            break;
        case 40:
            if(caca.state.vel.y != 1)caca.state.vel.y += +0.1;
            break;
        case 8:
            caca.state.vel.y = 0;
            caca.state.vel.x = 0;
            caca.state.angular.vel = 0;
            break;
    }
}