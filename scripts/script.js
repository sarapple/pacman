var fn = {};
var defs = {};

fn.init = function() {
	defs = {
		blinkloop : null,
		loop : null,
		looptime : 1000,
		invulnerable : 0,
		position : 0,
		lives : 3,
		score : 0,
		world : [
			2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
			2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
			2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1, 1, 1, 2,
			2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2,
			2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2,
			2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
			2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
			2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
			2, 1, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1, 2,
			2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
			2, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2,
			2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2,
			2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
		],
		ghosts : [
			59, 80
		],
		pacman : [
			16
		]
	};
}

fn.start = function(e) {
	$('.scene').removeClass('hidden');
	$('.scene').addClass('hidden');

	$('.wrapper').html($('.menu').clone());
	$('.menu').toggleClass('hidden');
};

fn.gamestarted = function() {
	$('.wrapper').html($('.map').clone());
	$('.map').toggleClass('hidden');
	fn.buildmap();

	$('.lives').attr("lives", defs.lives);
	$('.lives').text(defs.lives);
	$('.score').attr("score", defs.score);
	$('.score').text(defs.score);
	defs.loop = setInterval(fn.middle, defs.looptime);
};

fn.middle = function(e) {
	var invulnerable = false;
	if (defs.lives < 1) { //game end
		clearInterval(defs.loop);
		return fn.end();
	}

	if (defs.invulnerable >= 1) { //pacman is hit so invulnerable
		invulnerable = true;
		defs.invulnerable--;
		if (!defs.blinkloop) {
			defs.blinkloop = setInterval(fn.blink, 300);
			return;
		}
	}

	if (defs.blinkloop) { //not invulnerable, and blinkloop ending so remove the blinkin loop
		clearInterval(defs.blinkloop);
		delete defs.blinkloop;
		var pacman = $('.map .mapitem.pacman');
		pacman.removeClass('invulnerable');
	}

	fn.remap(invulnerable);
};

fn.remap = function(invulnerable) {
	var dirs = ['left', 'up', 'down', 'right'];
	var targetposition = null;
	var notmoved = true;
	var limitwhile = 10;
	var lostlife = false;

	for (var g = 0; g < defs.ghosts.length; g++) {
		notmoved = true;
		limitwhile = 10;
		while (notmoved && limitwhile) {
			var diridx = Math.floor(Math.random() * (dirs.length))

			targetposition = null;
			targetposition = fn.move(dirs[diridx], defs.ghosts[g]);

			if (targetposition) {
				if (targetposition === defs.pacman[0]) {
					lostlife = true;
				}
				defs.ghosts[g] = targetposition;
				notmoved = false;
			}
			limitwhile--;
		}
	}

	if (lostlife && !invulnerable) {
		fn.hit(function() {
			fn.buildmap();
		});
	} else {
		fn.buildmap();
	}
};

fn.blink = function() {
	var pacman = $('.map .mapitem.pacman');
	pacman.toggleClass('invulnerable');
}

fn.hit = function(cb) {
	defs.lives--;
	$('.lives').attr("lives", defs.lives);
	$('.lives').text(defs.lives);
	$('#loselife')[0].play();
	defs.invulnerable = 3; //invulnerable for 3 rounds when hit
};

fn.move = function(dir, startidx) {
	var targetposition = null;

	switch(dir) {
		case 'left': // left
			if (defs.world[startidx-1] && defs.world[startidx-1] !== 2) {
				targetposition = startidx-1;
			}
		break;

		case 'up': // up
			if (defs.world[startidx-14] && defs.world[startidx-14] !== 2) {
				targetposition = startidx-14;
			}
		break;

		case 'right': // right
			if (defs.world[startidx+1] && defs.world[startidx+1] !== 2) {
				targetposition = startidx+1;
			}
		break;
		case 'down': // down
			if (defs.world[startidx+14] && defs.world[startidx+14] !== 2) {
				targetposition = startidx+14;
			}
		break;
	}

	return targetposition;
}

fn.buildmap = function(e) {
	//states 2 : wall
	//1 : pacman bubble
	//3 : space where pacman ate bubble
	//4 : pacman
	var pacmanidx = defs.pacman[0];
	var ghostsidx = false;
	$('.map').html("");

	for (var i in defs.world) {
		ghostidx = false;
		for (var g in defs.ghosts) {
			if (defs.ghosts[g] == i) ghostidx = true;
		}
		if (i == pacmanidx) {
			$('.map').append(`<div class="mapitem pacman grey darken-4 z-depth-1"></div>`);
		} else if (ghostidx) {
			$('.map').append(`<div class="mapitem ghost grey darken-4 z-depth-1"></div>`);
		} else {
			switch (defs.world[i]) {
				case 1:
					$('.map').append(`<div class="mapitem coin present grey darken-4 z-depth-1"></div>`);
					break;
				case 2:
					$('.map').append(`<div class="mapitem wall indigo darken-4 z-depth-3"></div>`);
					break;
				case 3:
					$('.map').append(`<div class="mapitem coin grey darken-4 z-depth-1"></div>`);
					break;
				default:
			}
		}
	}
};

fn.end = function(e) {
	setTimeout(function(){
		$('#gameover')[0].play();
		$('.wrapper').html($('.gameover').clone());
		$('.gameover').toggleClass('hidden');
	}, 2000); //make sure lose life song finishes before playing game end song
};

$(document).keydown(function(e) {
	var dir = '';
	var startidx = defs.pacman[0];
	var targetposition;
	if (e.which === 37 || e.which === 38 || e.which === 39 || e.which === 40) {
		switch (e.which) {
			case 37:
				dir = 'left';
				break;
			case 38:
				dir = 'up';
				break;
			case 39:
				dir = 'right';
				break;
			case 40:
				dir = 'down';
				break;
			default:
		}
		e.preventDefault(); // prevent the default action (scroll / move caret)
		targetposition = fn.move(dir, startidx);
		if (targetposition) {
			var lostlife = false;
			for (var g = 0; g < defs.ghosts.length; g++) {
				if (targetposition == defs.ghosts[g]) lostlife = true;
			}

			if (defs.world[targetposition] == 1) {
				fn.eat();
			}

			if (lostlife && defs.invulnerable < 1) {
				fn.hit(function() {
					fn.buildmap();
				});
			} else {
				defs.world[startidx] = 3;
				defs.pacman[0] = targetposition;
				fn.buildmap();
			}
		}
	}
});

fn.eat = function() {
	$('#eating')[0].play();
	defs.score+=10;
	$('.score').attr("score", defs.score);
	$('.score').text(defs.score);
};

fn.startclicked = function(e) {
	$('.send-icon').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
		fn.gamestarted();
		$('.send-icon').removeClass('animated bounceOutRight');
	});

	$('.send-icon').addClass('animated bounceOutRight');
}
$(document).on('click', '#gamestart', fn.startclicked);
$(document).on('click', '#gamerestart', function(e) {
	if (defs.loop) clearInterval(defs.loop);
	if (defs.blinkloop) clearInterval(defs.blinkloop);
	fn.init();
	$('.gameover').toggleClass('hidden');
	$('.map').toggleClass('hidden');

	$('.resend-icon').addClass('animated bounceOutRight');
	fn.gamestarted();
});
$(document).ready(function() {


	fn.init();
	fn.start();
});
