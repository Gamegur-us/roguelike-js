/* global GameCtrl */
/* global game */
/* global ROT */
'use strict';
 
// map dimensions
var ROWS = 50;
var COLS = 50;
 
// number of actors per level, including player
var ACTORS = 25;


// a list of all actors; i0 is the player
var player;
var actorList;
 
var playerHUD;

// points to each actor in its position, for quick searching
var actorMap;


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

			
//			ROT.RNG.setSeed(124);

			this.mapData=generateMap('ROTmap',this.cache,COLS,ROWS,32,32);
			
			var map = this.add.tilemap('ROTmap');
			
			map.addTilesetImage('forest-tiles', 'forest-tiles');
	        var layer1 = map.createLayer('ground');
            layer1.resizeWorld();
			var layer2 = map.createLayer('decoration');
            layer2.resizeWorld();
			//return;
			
			//var layer2 = map.createBlankLayer('trees', _map._width, _map._height, 32, 32);
		    //layer2.resizeWorld();



			this.input.keyboard.addCallbacks(null, null, this.onKeyUp);

			Map.initMap(this.mapData);
	
			initActors(this);
	
			var style = { font: '16px monospace', fill:'#fff'};
			playerHUD=this.add.text(0, 0, 'Player life: 3', style);
			playerHUD.fixedToCamera = true;
    		playerHUD.cameraOffset.setTo(500, 50);


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
		tiles:null,
		rotmap:null,
		initMap: function(rotmap){
			this.rotmap=rotmap;
			this.tiles=JSON.parse(JSON.stringify(rotmap.map));
		},
		canGo:function (actor,dir) {
			return  actor.x+dir.x >= 0 &&
				actor.x+dir.x <= COLS - 1 &&
				actor.y+dir.y >= 0 &&
				actor.y+dir.y <= ROWS - 1 &&
				Map.tiles[actor.x +dir.x][actor.y+dir.y] === 0;
		}
	};

	
	function moveTo(actor, dir) {
		// check if actor can move in the given direction
		if (!Map.canGo(actor,dir)){
			return false;
		}

		if(dir.x===1){
			actor.sprite.frame=2;
		}else if(dir.x===-1){
			actor.sprite.frame=3;
		}else if(dir.y===-1){
			actor.sprite.frame=1;
		}else if(dir.y===1){
			actor.sprite.frame=0;
		}
			

		// moves actor to the new location
		var newKey = (actor.x + dir.x) +'_' + (actor.y + dir.y);
		// if the destination tile has an actor in it
		if (actorMap.hasOwnProperty(newKey) && actorMap[newKey]) {
			//decrement hitpoints of the actor at the destination tile
			var victim = actorMap[newKey];

			// avoid orcs to fight with each other
			if(!actor.isPlayer && !victim.isPlayer){
				return;
			}

			victim.hp--;

			var axis=(actor.x===victim.x)?'y':'x';

			dir=victim[axis]-actor[axis];
			dir=dir/Math.abs(dir); // +1 or -1

			var pos1={},pos2={};
			pos1[axis]=(dir*15).toString();
			pos2[axis]=(dir*15*(-1)).toString();

			
			game.camera.follow(false);
			
			game.add.tween(actor.sprite).to( pos1,100, Phaser.Easing.Linear.None,true)
			.to( pos2,100, Phaser.Easing.Linear.None,true)
			.onComplete.add(function(){
				game.camera.follow(actor.sprite);
			}, this);

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
			delete actorMap[actor.x + '_' + actor.y];

			// update position
			actor.setXY(actor.x+dir.x,actor.y+dir.y);
			

			// add reference to the actor's new position
			actorMap[actor.x + '_' + actor.y]=actor;
		}
		return true;
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
		
		var random=function (max) {
			return Math.floor(Math.random() * max);
		};

		var validpos=[];
		for(x=0;x<COLS;x++){
			for(y=0;y<ROWS;y++){
				if(!Map.tiles[x][y]){
					validpos.push({x:x,y:y});
				}
			}
		}


		for (var e=0; e<ACTORS; e++) {
			// create new actor
			do {
				//var room=m.rooms[random(2)][random(2)];
				var r=validpos[random(validpos.length)];
				x=r.x;
				y=r.y;
				// pick a random position that is both a floor and not occupied
				//x=room.x+random(room.width);
				//y=room.y+random(room.height);
			} while ( actorMap[x + '_' + y] );

			actor=(e===0)? new Player(game,x,y) :new Enemy(game,x,y);			


			// add references to the actor to the actors list & map
			actorMap[actor.x + '_' + actor.y]= actor;
			actorList.push(actor);
		}

		// the player is the first actor in the list
		player = actorList[0];
		game.camera.follow(player.sprite);
 
	}

	function aiAct(actor) {
		var directions = [ { x: -1, y:0 }, { x:1, y:0 }, { x:0, y: -1 }, { x:0, y:1 } ];
		var dx = player.x - actor.x;
		var dy = player.y - actor.y;
 
		var moveToRandomPos=function(){
			var rndDirections=shuffleArray(directions);
			for(var i=0;i<rndDirections.length;i++){
				if(moveTo(actor, rndDirections[i])){
					break;
				}
			}
		};

		// if player is far away, walk randomly
		if (Math.abs(dx) + Math.abs(dy) > 6){
			moveToRandomPos();
		}else{
			// otherwise walk towards player
			// dumb walk

			directions=directions.map(function(e){
				return {
					x:e.x,
					y:e.y,
					dist:Math.pow(dx+e.x,2)+Math.pow(dy+e.y,2)
				};
			//}).sort(function(a,b){ return a.dist-b.dist; });
		}).sort(function(a,b){ return b.dist-a.dist; });

			for(var d=0,len=directions.length;d<len;d++){
				if(moveTo(actor, directions[d])){
					break;
				}
			}
			
		}

		if (player.hp < 1) {
			// game over message
			var gameOver = game.add.text(0, 0, 'Game Over\nCtrl+r to restart', { fill : '#e22', align: 'center' } );
			gameOver.fixedToCamera = true;
    		gameOver.cameraOffset.setTo(500, 500);
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





function generateMap(keyName, _cache, width, height, tilewidth, tileheight){
	var _map = new ROT.Map.Rogue(width, height);

	var jsonmap={
		layers:[{
				data:new Array(width*height),
				height:height,
				name:'ground',
				opacity:1,
				type:'tilelayer',
				visible:true,
				width:width,
				x:0,
				y:0
        	},{
        		data:[],
				height:height,
				name:'decoration',
				opacity:1,
				type:'tilelayer',
				visible:true,
				width:width,
				x:0,
				y:0
			}
		],
 		orientation:'orthogonal',
 		properties:{},
 		tileheight:tileheight,
 		tilesets:[{
         	firstgid:1,
         	image:'assets/images/foresttiles_0.png', // ??
         	imagewidth:160,// ??
         	imageheight:224,// ??
         	margin:0,
         	name:'forest-tiles',
         	properties:{},
         	spacing:0,
         	tileheight:tileheight,
         	tilewidth:tilewidth
		}],
 		tilewidth:tilewidth,
 		version:1,
 		height:tileheight,
 		width:tilewidth
	};

	var ARENA=35;

	//	map.addTilesetImage('terrain_atlas');


	_map.create(function(x,y,v){
		// layer 0 es el "ground"
		//jsonmap.layers[0].data.push((v===1)? 0 : ARENA);
		jsonmap.layers[0].data[y*width+x]=(v===1)? 0 : ARENA;
		
		// y*width+x <- podria usar esta cuenta pero como esta ordenado uso el push
	});

	_cache.addTilemap(keyName,'', jsonmap);

	var _exist=function(x,y){
		return (typeof _map.map[x] !== 'undefined' && typeof _map.map[x][y]!== 'undefined' && _map.map[x][y]===0)? '1':'0';
	};



	var cbSetBackground=function(tile){
		return function(){
			jsonmap.layers[0].data[tilepos]=ARENA;
			jsonmap.layers[1].data[tilepos]=tile;
		};
	};

	var patternArray=[];
	var addPattern=function(pattern,cb){
		patternArray.push({
			regex:new RegExp(pattern.replace(/\*/g,'[0-1]')),
			cb:cb
		});	
	};


	addPattern(
		'000'+
		'0*0'+
		'*1*',function(tilepos,x,y){
			cbSetBackground(14)();
			if(y>0){
				jsonmap.layers[1].data[(y-1)*width+x]=9;
			}

		});
	
	addPattern(
		'000'+
		'0*0'+
		'1*1',function(tilepos,x,y){
			cbSetBackground(14)();
			if(y>0){
				jsonmap.layers[1].data[(y-1)*width+x]=9;
			}

		});
	
	addPattern(
		'000'+
		'0*0'+
		'001',function(tilepos,x,y){
			cbSetBackground(6)();
			if(y>0){
				jsonmap.layers[1].data[(y-1)*width+x]=1;
			}

		});
	
	addPattern(
		'00*'+
		'0*1'+
		'*11',function(tilepos,x,y){
			cbSetBackground(15)();
			if(y>0){
				jsonmap.layers[1].data[(y-1)*width+x]=10;
			}
		});

	addPattern(
		'00*'+
		'0*1'+
		'101',function(tilepos,x,y){
			cbSetBackground(15)();
			if(y>0){
				jsonmap.layers[1].data[(y-1)*width+x]=10;
			}
		});

	addPattern(
		'000'+
		'0*0'+
		'100',function(tilepos,x,y){
			cbSetBackground(7)();
			if(y>0){
				jsonmap.layers[1].data[(y-1)*width+x]=2;
			}
		});
	
	addPattern(
		'00*'+
		'0*1'+
		'00*',cbSetBackground(10));
	
	addPattern(
		'*1*'+
		'0*0'+
		'000',cbSetBackground(4));
	

	addPattern(
		'**1'+
		'0*0'+
		'000',cbSetBackground(11));
	
	addPattern(
		'111'+
		'0**'+
		'001',cbSetBackground(5));

	
	addPattern(
		'*00'+
		'1*0'+
		'*00',cbSetBackground(8));


	addPattern(
		'*00'+
		'**0'+
		'11*',cbSetBackground(13));

	addPattern(
		'*1*'+
		'1*0'+
		'*00',cbSetBackground(3));
	
	addPattern(
		'1**'+
		'**0'+
		'*00',cbSetBackground(12));
	
	addPattern(
		'**1'+
		'0**'+
		'00*',cbSetBackground(5));
	addPattern(
		'001'+
		'0*0'+
		'111',cbSetBackground(15));


	addPattern(
		'*00'+
		'1*0'+
		'1*1',cbSetBackground(13));


/*
	addPattern(
		'100'+
		'1*0'+
		'111',cbSetBackground(13));

	addPattern(
		'100'+
		'***'+
		'000',cbSetBackground(12));
	addPattern(
		'*11'+
		'0**'+
		'001',cbSetBackground(5));
	

	/*addPattern(
		'*11'+
		'1*0'+
		'000',cbSetBackground(3));
	
	/*
	addPattern(
		'*11'+
		'1*0'+
		'*00',cbSetBackground(3));
	addPattern(
		'00*'+
		'1*0'+
		'100',cbSetBackground(8));
	addPattern(
		'100'+
		'1*0'+
		'111',cbSetBackground(13));
	addPattern(
		'*11'+
		'0*1'+
		'***',cbSetBackground(5));
	addPattern(
		'00*'+
		'1*0'+
		'***',cbSetBackground(10));
	addPattern(
		'000'+
		'0*0'+
		'001',cbSetBackground(6));
	addPattern(
		'000'+
		'0*0'+
		'100',cbSetBackground(7));

	addPattern(
		'000'+
		'0*0'+
		'*1*',function(){
			jsonmap.layers[0].data[tilepos]= ARENA;
			//jsonmap.layers[1].data[tilepos]=8;??
			
			var r=ROT.RNG.getUniformInt(0,4);
			if(r===0){
				jsonmap.layers[1].data[tilepos]= 26;
			}else{
				jsonmap.layers[1].data[tilepos]= 14;
			}
	});
	*/


	addPattern(
		'*1*'+
		'***'+
		'*1*',function(){
			jsonmap.layers[0].data[tilepos]= ARENA;
			var f=[18,23,18];
			f=f[Math.floor((Math.random()*3))];
			jsonmap.layers[1].data[tilepos]=f;
	});
	addPattern(
		'***'+
		'1*1'+
		'***',function(){
			jsonmap.layers[0].data[tilepos]= ARENA;
			var f=[18,23,18];
			f=f[Math.floor((Math.random()*3))];
			jsonmap.layers[1].data[tilepos]=f;
	});



	for(var y=0;y<_map._height;y++){
		for(var x=0;x<_map._width;x++){
			jsonmap.layers[1].data.push(0);
			if(_map.map[x][y]===0){
				continue;
			}

			var tilepos=y*width+x;
			var direction=
				_exist(x-1,y-1)+_exist(x,y-1)+_exist(x+1,y-1)+
				// ml,*,mr  lepongo 0 por ponerle algo en realidad es siempre *
				_exist(x-1,y)+'1'+_exist(x+1,y)+
				_exist(x-1,y+1)+_exist(x,y+1)+_exist(x+1,y+1);

			for (var i = 0,len=patternArray.length;i < len; i++) {
				if(patternArray[i].regex.test(direction)){
					patternArray[i].cb(tilepos, x, y);
					break;
				}
			}

		}
	}

	return _map;
	
}

