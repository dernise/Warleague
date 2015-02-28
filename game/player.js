  /*
   *
   *  Player class, contains every controls
   *  and players' informations
   *
   */

  WarleagueGame.prototype.Player = function(options, game){
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
    this.id = options.id;
    this.username = options.username;
    this.game = game;
    
    /*
     * Update player movements
     */
    this.tick = function(dt){
      var wasleft  = this.dx < 0,
          wasright = this.dx > 0,
          falling    = this.falling,
          friction   = this.game.FRICTION * (falling ? 0.5 : 1),
          accel      = this.game.ACCEL * (falling ? 0.5 : 1);

      this.ddx = 0;
      this.ddy = this.game.GRAVITY;

      if(this.do_move_left)
        this.ddx = this.ddx - accel;
      else if(wasleft)
        this.ddx = this.ddx + friction; 

      if (this.do_move_right)
        this.ddx =  this.ddx + accel;     // player wants to go right
      else if (wasright)
        this.ddx =  this.ddx - friction; 

      if (this.do_jump && !this.jumping && !falling) {
        this.ddy = this.ddy - this.game.JUMP; // an instant big force impulse
        this.jumping = true;
      }

      this.y  = Math.floor(this.y  + (dt * this.dy));
      this.x  = Math.floor(this.x  + (dt * this.dx));
      this.dy = Math.max(-this.game.MAXDX, Math.min(this.game.MAXDX, this.dy + (dt * this.ddy)));
      this.dx = Math.max(-this.game.MAXDX, Math.min(this.game.MAXDX, this.dx + (dt * this.ddx)));

      if ((wasleft  && (this.dx > 0)) || (wasright && (this.dx < 0))) {
          this.dx = 0; 
      }

      var tx      = this.game.p2t(this.x),
        ty        = this.game.p2t(this.y),
        nx        = this.x%this.game.TILE,
        ny        = this.y%this.game.TILE,
        cell      = this.game.tcell(tx,     ty),
        cellright = this.game.tcell(tx + 1, ty),
        celldown  = this.game.tcell(tx,     ty + 1),
        celldiag  = this.game.tcell(tx + 1, ty + 1);

      if (this.dy > 0) {
        if ((celldown && !cell) ||
            (celldiag && !cellright && nx)) {
          this.y = this.game.t2p(ty);
          this.dy = 0;
          this.falling = false;
          this.jumping = false;
          ny = 0;
        }
      }

      else if (this.dy < 0) {
        if ((cell      && !celldown) ||
            (cellright && !celldiag && nx)) {
          this.y = this.game.t2p(ty + 1);
          this.dy = 0;
          cell      = celldown;
          cellright = celldiag;
          ny        = 0;
        }
      }

      if (this.dx > 0) {
        if ((cellright && !cell) ||
            (celldiag  && !celldown && ny)) {
          this.x = this.game.t2p(tx);
          this.dx = 0;
        }
      }
      else if (this.dx < 0) {
        if ((cell     && !cellright) ||
            (celldown && !celldiag && ny)) {
          this.x = this.game.t2p(tx + 1);
          this.dx = 0;
        }
      }

      this.falling = ! (celldown || (nx && celldiag));
    };
  };