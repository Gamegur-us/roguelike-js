/* global GameCtrl */

(function(){
	'use strict';

	GameCtrl.Preloader = function () {
		this.background = null;
		this.preloadBar = null;

		this.ready = false;

	};

	GameCtrl.Preloader.prototype = {

		preload: function () {
			//	These are the assets we loaded in Boot.js
			//	A nice sparkly background and a loading progress bar		
			this.background = this.add.sprite(this.game.width / 2 - 250, this.game.height / 2 - 70, 'preloaderBackground');
			this.preloadBar = this.add.sprite(this.game.width / 2 - 250, this.game.height / 2 - 70, 'preloaderBar');

			//	This sets the preloadBar sprite as a loader sprite.
			//	What that does is automatically crop the sprite from 0 to full-width
			//	as the files below are loaded in.
			this.load.setPreloadSprite(this.preloadBar);

			//	Here we load the rest of the assets our game needs.		
			//this.load.image('stage01', 'assets/images/stage01.png');
			
			//  This is how you load an atlas
			//this.load.atlas('playButton', 'assets/images/play_button.png', 'assets/images/play_button.json');

			//  This is how you load fonts
			//this.load.bitmapFont('caslon', 'assets/fonts/caslon.png', 'assets/fonts/caslon.xml');

		},

		create: function () {

			//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
			this.preloadBar.cropEnabled = false;

		},

		update: function () {
			this.game.state.start('Arena');
		}

	};

})();