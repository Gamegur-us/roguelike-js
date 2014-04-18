/* global GameCtrl */
/* global game */
'use strict';
// font size
var FONT = 32;
 
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
	this.sprite=null;
	this.spritebg= null;
	
	this.xPos=xPos;
	this.yPos=yPos;
}

TileSquare.prototype.createText=function(_char){
	var style = { font: FONT + 'px monospace', fill:'#fff'};
	this.spritebg= this.game.add.sprite(32*this.xPos, 32*this.yPos, 'forest-tiles');
	this.text=this.game.add.text(32*this.xPos, 32*this.yPos, _char, style);
	this.spritebg.frame=34;
	
	return this;
};

TileSquare.prototype.setText=function(_char){
	if(_char=='#'){
		this.sprite= this.game.add.sprite(32*this.xPos, 32*this.yPos, 'forest-tiles');
		var f=[17,22,23];
		this.sprite.frame=f[Math.floor((Math.random()*3))];
	}else{
		this.text.setText(_char);
	}
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
			initActors();
	
			Map.drawActors();
		},
		update: function () {
		},
		render: function(){
			// debug stuff
		},
		onKeyUp: function(event) {
			// draw map to overwrite previous actors positions
			Map.drawMap();

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

			// draw actors in new positions
			Map.drawActors();
		}
	};

	var Map={
		tiles:[],
		wall:null,
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
					if(!this.firstDraw && Map.tiles[y][x]==='#') continue;
					
					Screen[y][x].setText(Map.tiles[y][x]);
					
				}
			}
								this.firstDraw=false;

		},
		drawActors:function() {
			for (var a=0;a<actorList.length;a++) {
				if (actorList[a].hp > 0){
					var sprite=(a === 0) ? player.hp : 'e';
					Screen[actorList[a].y][actorList[a].x].setText(sprite);
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
			actor.y+=dir.y;
			actor.x+=dir.x;

			// add reference to the actor's new position
			actorMap[actor.y + '_' + actor.x]=actor;
		}
		return true;
	}

	function randomInt(max) {
		return Math.floor(Math.random() * max);
	}
 
	function initActors() {
		// create actors at random locations
		actorList = [];
		actorMap = {};
		for (var e=0; e<ACTORS; e++) {
			// create new actor
			var actor = { x:0, y:0, hp:e === 0?3:1 };
			
			do {
				// pick a random position that is both a floor and not occupied
				actor.y=randomInt(ROWS);
				actor.x=randomInt(COLS);
			
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
