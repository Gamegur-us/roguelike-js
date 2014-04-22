/* global GameCtrl */
/* global game */
/* global ROT */
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
 
var playerHUD;

// points to each actor in its position, for quick searching
var actorMap;

function TileSquare(game,xPos,yPos){
	this.game=game;
	this.spritebg= null;	
	this.xPos=xPos;
	this.yPos=yPos;

	this.spritebg= this.game.add.sprite(32*this.xPos, 32*this.yPos, 'forest-tiles');
	this.spritebg.frame=34;
}


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
			this.game.stage.backgroundColor='#2e203c';
			this.cursors=game.input.keyboard.createCursorKeys();
			//ROT.RNG.setSeed(1234);

			var _map = new ROT.Map.Rogue(35,35);
			//var _map = new ROT.Map.Digger(30,30);
			
			ROT.RNG.setSeed(124);

		    var map = this.add.tilemap();
			
	        var layer1 = map.create('ground', _map._width, _map._height, 32, 32);
            layer1.resizeWorld();

			
			var layer2 = map.createBlankLayer('trees', _map._width, _map._height, 32, 32);
		    layer2.resizeWorld();

			map.addTilesetImage('terrain_atlas');

			_map.create(function(x,y,v){
				if(v){
					return;					
				}
				map.putTile(34, x, y, layer1);
			});


			var _exist=function(x,y){
				return (typeof _map.map[x] !== 'undefined' && typeof _map.map[x][y]!== 'undefined' && _map.map[x][y]===0);
			};

			for(var y=0;y<_map._height;y++){
				for(var x=0;x<_map._width;x++){
					if(_map.map[x][y]===0){
						continue;
					}

					var directions={
						ul: _exist(x-1,y-1),
						um: _exist(x,y-1),
						ur: _exist(x+1,y-1),
						ml: _exist(x-1,y),
						//mm: exist(x-1,y),
						mr: _exist(x+1,y),
						bl: _exist(x-1,y+1),
						bm: _exist(x,y+1),
						br: _exist(x+1,y+1),
					};

					if(directions.um  && directions.ul  && directions.ur  &&
						!directions.ml && !directions.mr &&
						!directions.bl && !directions.bm && !directions.br ){
						
						// tope superior						
						map.putTile(34, x, y, layer1);
						map.putTile(3, x, y, layer2);
					}else if(directions.um  && directions.ul 
						&& directions.ml && !directions.mr &&
						!directions.bm &&!directions.br 
						){
						// borde izq sup
						map.putTile(34, x, y, layer1);
						map.putTile(2, x, y, layer2);
					}else if(!directions.ur && !directions.um &&
						directions.ml && !directions.mr &&
						directions.bl && !directions.bm && !directions.br 
						){
						// borde izq med
						map.putTile(34, x, y, layer1);
						map.putTile(7, x, y, layer2);
					}else if(directions.ul  && !directions.ur && !directions.um &&
						directions.ml && !directions.mr &&
						directions.bl && directions.bm && directions.br 
						){
						// borde izq aba
						map.putTile(34, x, y, layer1);
						map.putTile(12, x, y, layer2);
					}else if(directions.um  && directions.ur 
						&& directions.mr && !directions.ml &&
						!directions.bm &&!directions.bl 
						){
						// borde der sup
						map.putTile(34, x, y, layer1);
						map.putTile(4, x, y, layer2);
					}else if( !directions.ul && !directions.um &&
						directions.mr && !directions.ml &&
						!directions.bl && !directions.bm && directions.br 
						){
						// borde der med
						map.putTile(34, x, y, layer1);
						map.putTile(9, x, y, layer2);
					}else if(!directions.ul  && directions.ur && !directions.um &&
						!directions.ml && directions.mr &&
						directions.br 
						){
						// borde der aba
						map.putTile(34, x, y, layer1);
						map.putTile(14, x, y, layer2);
					}else if(!directions.ul  && !directions.ur && !directions.um &&
						!directions.ml && !directions.mr &&
						!directions.bl && !directions.bm && directions.br
						){
						map.putTile(34, x, y, layer1);
						
						if(y>0){
							map.putTile(0, x, y-1, layer2);
						}
						map.putTile(5, x, y, layer2);
					}else if(!directions.ul  && !directions.ur && !directions.um &&
						!directions.ml && !directions.mr &&
						directions.bl && !directions.bm && !directions.br
						){
						map.putTile(34, x, y, layer1);
						
						if(y>0){
							map.putTile(1, x, y-1, layer2);
						}
						map.putTile(6, x, y, layer2);
					}else if(!directions.ul  && !directions.ur && !directions.um &&
							!directions.ml && !directions.mr &&
							 directions.bm 
						){
						map.putTile(34, x, y, layer1);
						if(y>0){
							map.putTile(8, x, y-1, layer2);
						}
						
						var r=ROT.RNG.getUniformInt(0,4);
						if(r===0){
							map.putTile(25, x, y, layer2);
						}else{
							map.putTile(13, x, y, layer2);
						}
					}else if(directions.um && directions.bm ){
						map.putTile(34, x, y, layer1);
						map.putTile(17, x, y, layer2);
					}
				}
			}

			/*

			var _rooms=_map.getRooms();
			for(var i=0;i<_rooms.length;i++){
				var r=_rooms[i];
				for(var j=r.getLeft();j<=r.getRight();j++){
					for(var k=r.getTop();k<=r.getBottom();k++){	
						map.putTile(32, j, k, layer1);
					}
				}

				for(var d in r._doors){
					var coord=d.split(',');
					map.putTile(31, coord[0], coord[1], layer2);	
			
				}
			}
//return;

			var _rooms=_map.getCorridors();
			
			for(var i=0;i<_rooms.length;i++){
				var r=_rooms[i];
				
				for(var j=r._startX;j<=r._endX;j++){
					for(var k=r._startY;k<=r._endY;k++){	
						map.putTile(31, j, k, layer2);	
					}
				}
			}*/

			//return;
			return;
			this.input.keyboard.addCallbacks(null, null, this.onKeyUp);
			Map.initMap();
	
			for (var y = 0; y < ROWS; y++) {
				var newRow = [];
				Screen.push(newRow);
				for (var x = 0; x < COLS; x++){
					newRow.push(new TileSquare(this, x, y));
				}
			}
			Map.drawMap();
			initActors(this);
	
			var style = { font: '16px monospace', fill:'#fff'};
			playerHUD=this.add.text(COLS*32+16, 32, 'Player life: 3', style);

		},
		update: function () {

		    if (this.cursors.left.isDown)
		    {
		        game.camera.x -= 4;
		    }
		    else if (this.cursors.right.isDown)
		    {
		        game.camera.x += 4;
		    }

		    if (this.cursors.up.isDown)
		    {
		        game.camera.y -= 4;
		    }
		    else if (this.cursors.down.isDown)
		    {
		        game.camera.y += 4;
		    }

		},
		render: function(){
			// debug stuff
		},
		onKeyUp: function(event) {
			
			if(!actorList[0].isPlayer){
				//gameover
				return;
			}

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

			// avoid orcs to fight with each other
			if(!actor.isPlayer && !victim.isPlayer){
				return;
			}

			victim.hp--;

			setTimeout(function(game,victim){
				game.add.tween(victim.sprite).to( { x:'+10'},50, Phaser.Easing.Linear.None,true)
				.to( { x:'-20'},50, Phaser.Easing.Linear.None,true)
				.to( { x:'+20'},50, Phaser.Easing.Linear.None,true)
				.to( { x:'-10'},50, Phaser.Easing.Linear.None,true);
			},200,game,victim);

			if(victim.isPlayer){
				playerHUD.setText('Player life: '+victim.hp);
			}

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

	function Actor(game,x,y,keySprite){
		this.hp=3;
		this.x=x;
		this.y=y;
		this.isPlayer=null;
		if(game){
			this.game=game;
			this.sprite=game.add.sprite(x*32,y*32,keySprite);
		}else{
			this.game=null;
			this.sprite=null;
		}
	}

	Actor.prototype.setXY=function(x,y){
		this.x=x;
		this.y=y;

		//this.sprite.x=x*32;
		//this.sprite.y=y*32;

		this.game.add.tween(this.sprite).to( { x:x*32, y:y*32 }, 150, Phaser.Easing.Linear.None,true);

	};

 
	function Player(game,x,y){
		Actor.call(this,game,x,y,'hero');
		this.hp=3;
		this.isPlayer=true;
		
	}
	Player.prototype = new Actor();

	function Enemy(game,x,y){
		Actor.call(this,game,x,y,'orc');
		this.hp=1;
		this.isPlayer=false;
	}
	Enemy.prototype = new Actor();

	
	function initActors(game) {
		// create actors at random locations
		actorList = [];
		actorMap = {};
		var actor,x,y;
		for (var e=0; e<ACTORS; e++) {
			// create new actor
			
			do {
				// pick a random position that is both a floor and not occupied
				x=randomInt(COLS);
				y=randomInt(ROWS);
			} while ( Map.tiles[y][x] === '#' || actorMap[y + '_' + x] );

			actor=(e===0)? new Player(game,x,y) :new Enemy(game,x,y);			


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

