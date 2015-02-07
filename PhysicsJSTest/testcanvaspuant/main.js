var canvas = document.getElementById("gemu");

var ctx = canvas.getContext("2d");

var line = {
	originx:0, originy:690,
	arrivalx:1280, arrivaly:690,
	color:"#FF0000",
	create:function(){
		ctx.moveTo(line.originx,line.originy);
		ctx.lineTo(line.arrivalx,line.arrivaly);
		ctx.strokeStyle = line.color;
		ctx.stroke();
	}
}

line.create();

/*var perso = {
	width:10, height:20,
	x:10, y:650,
	color:"#FFF000",
	create:function(){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.width,this.height);
	}
}

perso.create();*/
function perso(width, height, posx, posy, color) {
    this.w = width;
    this.h = height;
    this.x = posx;
    this.y = posy;
    this.c = color;
    this.display = function(){
    	ctx.fillStyle = this.c;
		ctx.fillRect(this.x,this.y,this.w,this.h);
    }
}


var bob = new perso(10,20,10,650, "#FFF000")

bob.display();

document.onkeydown = function(touche){
	    switch (touche.keyCode) {
        case 37:
            ctx.clearRect(bob.x, bob.y, bob.w, bob.h);
            bob.x -= 1.5;
            bob.display();
            break;
        case 38:
            ctx.clearRect(bob.x, bob.y, bob.w, bob.h);
            bob.y -= 1.5;
            bob.display();
            break;
        case 39:
        	ctx.clearRect(bob.x, bob.y, bob.w, bob.h);
            bob.x += 1.5;
            bob.display();
            break;
        case 40:
        	ctx.clearRect(bob.x, bob.y, bob.w, bob.h);
        	bob.y += 1.5;
            bob.display();
            break;
    }
}
/*
var perso = {
	width:10, height:20,
	x:10, y:650,
	color:"#FFF000",
	create:function(){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.width,this.height);
	}
}

	perso.create;


document.onkeydown = function(touche){
	    switch (touche.keyCode) {
        case 37:
            ctx.clearRect(perso.x, perso.y, perso.x-canvas.width, perso.y-canvas.height);
            perso.x -= 1;
            perso.create;
            break;
        case 38:
            
            break;
        case 39:
            perso.x += 1;
            perso.create;
            break;
        case 40:
            break;
    }
}


/*

var canvas = document.getElementById("gemu");

var ctx = canvas.getContext("2d");

var line = {
	originx:0, originy:690,
	arrivalx:1280, arrivaly:690,
	color:"#FF0000",
	create:function(){
		ctx.moveTo(line.originx,line.originy);
		ctx.lineTo(line.arrivalx,line.arrivaly);
		ctx.strokeStyle = line.color;
		ctx.stroke();
	}
}

line.create();

var perso = {
	width:10, height:20,
	x:10, y:650,
	color:"#FFF000",
	create:function(){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.width,this.height);
	}
}

	perso.create();


document.onkeydown = function(touche){
	    switch (touche.keyCode) {
        case 37:
            perso.x -= 1;
            perso.create;
            break;
        case 38:
            
            break;
        case 39:
            perso.x += 1;
            perso.create;
            break;
        case 40:
            break;
    }
}*/