var BALLSIZE = 12,
    timeDelay = 1,
    blocksOnScreen = 0,
    debugging = true,
    currentLevel=12,
    interval= null,
    playerShipSpeed = 60,
    soundsEnabled = true,
    infiniteLives = false,
    ball = null,
    paused = false,
    currentBGMusic;

var windowBorder = {
  left:0,
  top:0,
  right:$(window).width(),
  bottom:$(window).height()
};

function Block(x, y, w, h, color) {   //x coord, y coord, width, height
  this.html = $('<div>').addClass('block collideableObject').css({left:x, top:y, width:w, height:h, 'background-color': color}).appendTo('body');
    blocksOnScreen++;
}


/*  algorithm for ball and ball movement adapted from
http://bassistance.de/2011/12/09/vector-math-basics-to-animate-a-bouncing-ball-in-javascript/ */

function Ball(x, y, dx, dy) {
  this.x = x;
  this.y = y;
  this.dx = dx;       //delta x (change in position)
  this.dy = dy;       //delta y
  this.html = $('<div>').addClass('ball').css({left:this.x, top:this.y, width:BALLSIZE, height:BALLSIZE}).appendTo('body');
};

Ball.prototype.move = function() {
  this.x += this.dx;
  this.y += this.dy;
  this.html.css({
    left: this.x,
    top: this.y
    });
};

Ball.prototype.checkBorders = function() {
  if(this.y <= windowBorder.top) {
    this.dy = -this.dy;
    this.y = windowBorder.top;
    if(soundsEnabled)  {
      $("#arrow")[0].play();
    }
  }
  else if(this.y >= windowBorder.bottom - 3*BALLSIZE) {
    if(debugging) {
      this.dy = -this.dy;
      this.y = windowBorder.bottom - 3*BALLSIZE;
      if(soundsEnabled)  {
        $("#arrow")[0].play();
      }
    }
    else {
      if(soundsEnabled)  {
        $("#explosion")[0].play();
      }
      $('.playerShip').hide("explode", 2000);
      $('.ball').hide("explode");
      clearInterval(interval);
    }
  }
  if(this.x <= windowBorder.left) {
    this.dx = -this.dx;
    this.x = windowBorder.left;
    if(soundsEnabled)  {
      $("#arrow")[0].play();
    }
  }
  else if(this.x >= windowBorder.right - BALLSIZE) {
    this.dx = -this.dx;
    this.x = windowBorder.right - BALLSIZE;
    if(soundsEnabled)  {
      $("#arrow")[0].play();
    }
  }
}

Ball.prototype.checkCollision = function() {
  var ball = this;
  $('.collideableObject').each(function() {
    var objectPosition = $(this).offset();
    if(ball.dy > 0) {  //moving down
      var ballBorder = {
        x: ball.x+BALLSIZE/2,
        y: ball.y+BALLSIZE
      };
      if(pointIsWithinRectangle(ballBorder, objectPosition.left, objectPosition.top, $(this).width(), $(this).height())) {
        ball.dy = -ball.dy;
        ball.y = Math.floor(objectPosition.top - BALLSIZE);
        collisionHappened(this);
      }
    }
    else if(ball.dy < 0) {  //moving up
      var ballBorder = {
        x: ball.x+BALLSIZE/2,
        y: ball.y
      };
      if(pointIsWithinRectangle(ballBorder, objectPosition.left, objectPosition.top, $(this).width(), $(this).height())) {
        ball.dy = -ball.dy;
        ball.y = Math.floor(objectPosition.top + $(this).height());
        collisionHappened(this);
      }
    }
    if (ball.dx > 0) { // moving right
      var ballBorder = {
        x: ball.x + BALLSIZE,
        y: ball.y + BALLSIZE/2
      }
      if(pointIsWithinRectangle(ballBorder, objectPosition.left, objectPosition.top, $(this).width(), $(this).height())) {
        ball.dx = -ball.dx;
        ball.x = Math.floor(objectPosition.left - BALLSIZE);
        collisionHappened(this);
      }
    }
    else if (ball.dx < 0) {  // moving left
      var ballBorder = {
        x: ball.x,
        y: ball.y + BALLSIZE/2
      }
      if(pointIsWithinRectangle(ballBorder, objectPosition.x, objectPosition.y, $(this).width(), $(this).height())) {
        ball.dx = -ball.dx;
        ball.x = Math.floor(objectPosition.left + $(this).width());
        collisionHappened(this);
      }
    }
  })
}

function pointIsWithinRectangle(point, x, y, width, height) {
  if(point.x > x && point.x < x + width && point.y > y && point.y < y + height) {
    return true;
  }
  return false;
}

function congratulationAnimation() {
  $('.ball').addClass('ballEnlarge');
  setTimeout(function() {
    var congratulate = "<h1>HELL YEAH!</h1>";
    $(congratulate).addClass('congratulations').css({'text-align':'center', 'vertical-align':'middle'}).appendTo('body');
    $('.ball').removeClass('ballEnlarge');
  }, 2000);
}

function levelCompleted() {
  if(soundsEnabled)  {
    $(currentBGMusic)[0].pause();
    $("#fanfare")[0].play();
  }
  currentLevel++;
  clearInterval(interval);
  congratulationAnimation();
  setTimeout(function() {
    $('.ball').remove()}, 2000);
}

function collisionHappened(collidee) {
  if($(collidee).hasClass('block')) {
    if(soundsEnabled)  {
      $('#pong')[0].play();
    }
    $(collidee).removeClass('collideableObject');
    $(collidee).hide('puff', 300, function() {
      $(collidee).remove();
    });
    blocksOnScreen--;
    if(blocksOnScreen == 0) {
      levelCompleted();
    }
  }
}

function level1Layout() {
  var rows = [];
  rows.push(['green']);
  /*rows.push([0, 0, 'red', 'red', 'red','red','red','red','red','red', 0, 0]);
  rows.push([0,'red','orange','green', 0, 0, 0, 0,'green', 'orange','red', 0]);
  rows.push([0,'red','orange',0, 0, 0, 0, 0, 0, 'orange','red',0]);
  rows.push([0,'red','orange','green', 0, 0, 0, 0,'green','orange','red', 0]);
  rows.push([0, 0,'red','red','red','red','red','red','red','red', 0, 0]);
  rows.push(['green']);*/
  return rows;
}

function initializeLevel() {
  if(soundsEnabled) {
    currentBGMusic = '#ChronoTheme';
    $(currentBGMusic)[0].loop=true;
    $(currentBGMusic)[0].play();
  }
  blocksOnScreen = 0;
  var rows = level1Layout();
  for(var i=0; i<rows.length; i++) {
    var row = rows[i];
    var n = row.length;
    var blockWidth = Math.floor(windowBorder.right/n-7);
    var blockHeight = Math.floor(windowBorder.bottom*0.04-1);
    for (var j=0; j<n; j++) {
      if (row[j] != 0) {
        var block = new Block(windowBorder.right*(j/n), windowBorder.bottom * (i*0.05), blockWidth, blockHeight, row[j]);
      }
    }
  }
  ball = new Ball(200, 600, 3, -4);
}

function keyHeldDown(event) {
  if(event.which === 37)  {  //left arrow, move ship left
    var x = $('.playerShip').offset().left;
    if(x>0) {
      $('.playerShip').css({left: x-playerShipSpeed});
    }
  }
  else if(event.which === 39)  {  //right arrow, move ship right
    var x = $('.playerShip').offset().left;
    if(x<windowBorder.right-$('.playerShip').width()) {
      $('.playerShip').css({left: x+playerShipSpeed});
    }
  }
}

function keyWasPressed(event) {
  if(event.which === 32)  {  //space key pressed, start interval
    if(!interval && !paused) {
      interval = setInterval(gameLoop, timeDelay);
    }
  }
  else if(event.which === 80) { //'p' pressed.  pause/unpause game
    if(interval) {
      paused = true;
      clearInterval(interval);
      interval = null;
      var message = $('<p>PAUSED *Press p to continue*</p>').addClass('pauseMessage').appendTo('body');
      if(soundsEnabled) {
        $(currentBGMusic)[0].pause();
      }
    }
    else {
      paused = false;
      $('.pauseMessage').remove();
      interval = setInterval(gameLoop, timeDelay);
      if(soundsEnabled) {
        $(currentBGMusic)[0].play();
      }
    }
  }
}

function gameLoop() {
  ball.move();
  ball.checkBorders();
  ball.checkCollision();
}

$(function() {
  $(window).resize(function() {
    windowBorder.right = $(window).width();
    windowBorder.bottom = $(window).height();
  }).trigger("resize");
  initializeLevel();
  $('.playerShip').draggable({axis: "x", containment: 'parent'});
  $(document).keydown(function(event) {
    keyHeldDown(event)
  });
  $(document).keyup(function(event) {
    keyWasPressed(event)
  });
});




/////// Properties accessed by jquery /////////////////
/*<div class="ball" data-index="0" data-dx="" data-dy=""></div>

// to retrieve value
$currentBall.data("dy")
// to change value:
$currentBall.data("dy", 3)

*/
