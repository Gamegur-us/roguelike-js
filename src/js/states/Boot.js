/* global GameCtrl */

(function () {
	'use strict';

	GameCtrl.Boot = function () {
	};

	GameCtrl.Boot.prototype = {
		preload: function () {
			this.load.image('preloaderBackground', 'assets/images/progress_bar_background.png');
			this.load.image('preloaderBar', 'assets/images/progress_bar.png');
		},
		create: function () {
			this.game.state.start('Preloader');
		}
	};

})();
