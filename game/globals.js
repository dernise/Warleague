/**
 * Contains every game globals
 */

var WarleagueGlobals = {
	MAP : { tw: 64, th: 48 },
    TILE : 30,
    KEY : { SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40 },
}

WarleagueGlobals.METER = WarleagueGlobals.TILE; 
WarleagueGlobals.GRAVITY = WarleagueGlobals.METER * 9.8 * 6; // exagerated gravity
WarleagueGlobals.MAXDX = WarleagueGlobals.METER * 40; // max horizontal speed (20 tiles per second)
WarleagueGlobals.MAXDY = WarleagueGlobals.METER * 40; // max vertical speed (60 tiles per second)
WarleagueGlobals.ACCEL = WarleagueGlobals.MAXDX * 5;  // take 1/2 second to reach maxdx     (horizontal acceleration)
WarleagueGlobals.FRICTION = WarleagueGlobals.MAXDX * 6000; // take 1/6 second to stop from maxdx (horizontal friction)
WarleagueGlobals.JUMP = WarleagueGlobals.METER * 1500; // (big) instantaneous jump impulse
WarleagueGlobals.COLOR = { BLACK: '#000000', YELLOW: '#ECD078', BRICK: '#D95B43', PINK: '#C02942', PURPLE: '#542437', GREY: '#333', SLATE: '#53777A' };
WarleagueGlobals.COLORS = [ WarleagueGlobals.COLOR.BLACK, WarleagueGlobals.COLOR.YELLOW, WarleagueGlobals.COLOR.BRICK, WarleagueGlobals.COLOR.PINK, WarleagueGlobals.COLOR.PURPLE, WarleagueGlobals.COLOR.GREY ];

/**
 * Global functions
 */

WarleagueGlobals.t2p = function(t) { return t*this.TILE; };
WarleagueGlobals.p2t = function(p) { return Math.floor(p/this.TILE); };
WarleagueGlobals.cell = function(x,y)   { return this.tcell(this.t2p(x),this.t2p(y)); };
WarleagueGlobals.tcell = function(tx,ty) { return this.cells[tx + (ty*this.MAP.tw)]; };
