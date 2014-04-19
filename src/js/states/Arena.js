/* global GameCtrl */
/* global game */
'use strict';
 
// map dimensions
var ROWS = 10;
var COLS = 15;
 
// number of actors per level, including player
var ACTORS = 10;

var Screen = [];

// a list of all actors; i0 is the player
var player;
var actorList;
 
// points to each actor in its position, for quick searching
var actorMap;

function TileSquare(game,xPos,yPos){
	this.game=game;
	this.text=null;
	this.spritebg= null;
	
	this.xPos=xPos;
	this.yPos=yPos;
}

TileSquare.prototype.createText=function(){
	this.spritebg= this.game.add.sprite(32*this.xPos, 32*this.yPos, 'forest-tiles');
	this.spritebg.frame=34;
	
	return this;
};

TileSquare.prototype.setObstacle=function(){
	var sprite=this.game.add.sprite(32*this.xPos, 32*this.yPos, 'forest-tiles');
	var f=[17,22,23];
	sprite.frame=f[Math.floor((Math.random()*3))];
};

(function(){
	GameCtrl.Arena = function () {

			//        When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:
	/*
		this.game;                //        a reference to the currently running game
		this.add;                //        used to add sprites, text, groups, etc
		this.camera;        //        a reference to the game camera
		this.cache;                //        the game cache
		this.input;                //        the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
		this.load;                //        for preloading assets
		this.math;                //        lots of useful common math operations
		this.sound;                //        the sound manager - add a sound, play one, set-up markers, etc
		this.stage;                //        the game stage
		this.time;                //        the clock
		this.tweens;        //        the tween manager
		this.world;                //        the game world
		this.particles;        //        the particle manager
		this.physics;        //        the physics manager
		this.rnd;                //        the repeatable random number generator
	*/
		//        You can use any of these from any function within this State.
		//        But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

	};

	GameCtrl.Arena.prototype = {
		
		create: function () {
			this.input.keyboard.addCallbacks(null, null, this.onKeyUp);
			Map.initMap();
	
			for (var y = 0; y < ROWS; y++) {
				var newRow = [];
				Screen.push(newRow);
				for (var x = 0; x < COLS; x++){
					newRow.push(new TileSquare(this, x, y).createText());
				}
			}
			Map.drawMap();
			initActors(this);
	
			

		},
		update: function () {
			this.add.sprite('hero');
		},
		render: function(){
			// debug stuff
		},
		onKeyUp: function(event) {
			
			var acted=false;

			// act on player input
			if(event.keyCode===Phaser.Keyboard.LEFT) {
					acted=moveTo(player, {x:-1, y:0});
			} else if(event.keyCode===Phaser.Keyboard.RIGHT) {
				acted=moveTo(player,{x:1, y:0});
			} else if(event.keyCode===Phaser.Keyboard.UP) {
				acted=moveTo(player, {x:0, y:-1});
			} else if(event.keyCode===Phaser.Keyboard.DOWN) {
				acted=moveTo(player, {x:0, y:1});
			}

			if (acted){
				var enemy;

				// i=1, skip the player
                for (var i=1;i<actorList.length;i++) {
					enemy=actorList[i];
					aiAct(enemy);
                }
			}
		}
	};

	var Map={
		tiles:[],
		firstDraw:true,
		initMap: function() {
			// create a new random map
			this.tiles = [];
			for (var y = 0; y < ROWS; y++) {
				var newRow = [];
				for (var x = 0; x < COLS; x++) {
					if (Math.random() > 0.8){
						newRow.push('#');
					}else{
						newRow.push(' ');
					}
				}
				this.tiles.push(newRow);
			}
		},
		drawMap:function() {
			for (var y = 0; y < ROWS; y++){
				for (var x = 0; x < COLS; x++){
					if(Map.tiles[y][x]!=='#'){
						continue;
					}
					
					Screen[y][x].setObstacle(Map.tiles[y][x]);
					
				}
			}

		},
		canGo:function (actor,dir) {
			return  actor.x+dir.x >= 0 &&
				actor.x+dir.x <= COLS - 1 &&
				actor.y+dir.y >= 0 &&
				actor.y+dir.y <= ROWS - 1 &&
				Map.tiles[actor.y+dir.y][actor.x +dir.x] === ' ';
		}
	};

	
	function moveTo(actor, dir) {
		// check if actor can move in the given direction
		if (!Map.canGo(actor,dir)){
			return false;
		}

 
		// moves actor to the new location
		var newKey = (actor.y + dir.y) +'_' + (actor.x + dir.x);
		// if the destination tile has an actor in it
		if (actorMap.hasOwnProperty(newKey) && actorMap[newKey]) {
			//decrement hitpoints of the actor at the destination tile
			var victim = actorMap[newKey];
			victim.hp--;

			// if it's dead remove its reference
			if (victim.hp === 0) {
				victim.sprite.kill();
				delete actorMap[newKey];
				actorList.splice(actorList.indexOf(victim), 1);
				if(victim!==player) {
					if (actorList.length === 1) {
						// victory message
						var victory = game.add.text(game.world.centerX, game.world.centerY, 'Victory!\nCtrl+r to restart', { fill : '#2e2', align: 'center' } );
						victory.anchor.setTo(0.5,0.5);
					}
				}
			}
		} else {
			// remove reference to the actor's old position
			delete actorMap[actor.y + '_' + actor.x];

			// update position
			actor.setXY(actor.x+dir.x,actor.y+dir.y);
			//if(actor.isPlayer){
			if(dir.x===1){
				actor.sprite.frame=2;
			}else if(dir.x===-1){
				actor.sprite.frame=3;
			}else if(dir.y===-1){
				actor.sprite.frame=1;
			}else if(dir.y===1){
				actor.sprite.frame=0;
			}
			//}
			

			// add reference to the actor's new position
			actorMap[actor.y + '_' + actor.x]=actor;
		}
		return true;
	}

	function randomInt(max) {
		return Math.floor(Math.random() * max);
	}

 
	function Player(game,x,y){
		this.hp=3;
		this.x=x;
		this.y=y;
		this.isPlayer=true;
		this.sprite=game.add.sprite(x*32,y*32,'hero');

	}

	Player.prototype.setXY=function(x,y){
		this.x=x;
		this.y=y;
		this.sprite.x=x*32;
		this.sprite.y=y*32;
	};

	function Enemy(game,x,y){
		this.hp=1;
		this.x=x;
		this.y=y;
		this.isPlayer=false;
		this.sprite=game.add.sprite(x*32,y*32,'orc');
		this.sprite.x=x*32;
		this.sprite.y=y*32;
	}

	Enemy.prototype.setXY=function(x,y){
		this.x=x;
		this.y=y;
		this.sprite.x=x*32;
		this.sprite.y=y*32;
	};


	function initActors(game) {
		// create actors at random locations
		actorList = [];
		actorMap = {};
		var actor;
		for (var e=0; e<ACTORS; e++) {
			// create new actor
			
			
			actor=(e===0)? new Player(game,0,0) :new Enemy(game,0,0);			

			do {
				// pick a random position that is both a floor and not occupied
				var x=randomInt(COLS),y=randomInt(ROWS);
				actor.setXY(x,y);
					
			} while ( Map.tiles[actor.y][actor.x] === '#' || actorMap[actor.y + '_' + actor.x] );

			// add references to the actor to the actors list & map
			actorMap[actor.y + '_' + actor.x]= actor;
			actorList.push(actor);
		}
 
		// the player is the first actor in the list
		player = actorList[0];
	}

	function aiAct(actor) {
		var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];
		var dx = player.x - actor.x;
		var dy = player.y - actor.y;
 
		// if player is far away, walk randomly
		if (Math.abs(dx) + Math.abs(dy) > 6){
			var rndDirections=shuffleArray(directions);
			for(var i=0;i<rndDirections.length;i++){
				if(moveTo(actor, rndDirections[i])){
					break;
				}
			}
		}
		
		// otherwise walk towards player
		if (Math.abs(dx) > Math.abs(dy)) {
				if (dx < 0) {
					// left
					moveTo(actor, directions[0]);
				} else {
					// right
					moveTo(actor, directions[1]);
				}
		} else {
				if (dy < 0) {
					// up
					moveTo(actor, directions[2]);
				} else {
					// down
					moveTo(actor, directions[3]);
				}
		}
		if (player.hp < 1) {
			// game over message
			var gameOver = game.add.text(game.world.centerX, game.world.centerY, 'Game Over\nCtrl+r to restart', { fill : '#e22', align: "center" } );
			gameOver.anchor.setTo(0.5,0.5);
		}
	}
	
	function shuffleArray(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
		return array;
	}
}());
