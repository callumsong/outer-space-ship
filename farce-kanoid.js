var BALLSIZE = 12,
    timeDelay = 12,
    blocksOnScreen = 0,
    debugging = true,
    currentLevel = 1,
    interval= null,
    playerShipSpeed = 60,
    soundsEnabled = true,
    currentBGMusic;


var windowBorder = {
  left:0,
  top:0,
  right:$(window).width(),
  bottom:$(window).height()
};

function Block(x, y, w, h, color) {   //x coord, y coord, width, height
  this.html = $('<div>').addClass('block collideableObject').css({left:x, top:y, width:w, height:h, 'background-color': color}).appendTo('body');  // consider adding unique id to track individual elements
    blocksOnScreen++;
}

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
  var ballWidth = $('.ball'). width() + 10;  //10 for margin
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

function makeBallGetBigAndSparkle() {
  if(soundsEnabled)  {
    $(currentBGMusic)[0].pause();
    $("#fanfare")[0].play();
  }
  $('.ball').addClass('ballEnlarge');
  setTimeout(function() {
    var congratulate = "<h1>HELL YEAH!</h1>";
    $(congratulate).addClass('congratulations').css({'text-align':'center', 'vertical-align':'middle'}).appendTo('body');
  }, 2000);
}

function levelCompleted() {
  currentLevel++;
  clearInterval(interval);
  makeBallGetBigAndSparkle();
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
  rows.push([0, 0, 0, 'red', 'red','red','red','red','red', 0, 0, 0]);
  rows.push(['red','red','red',0, 0, 0, 0, 0, 0, 'red','red','red']);
  rows.push(['red','red','red',0, 0, 0, 0, 0, 0, 'red','red','red']);
  rows.push([0, 0, 0, 'red','red','red','red','red','red', 0, 0, 0]);
  rows.push(['purple','#00FFFF','#00FFFF','#00FFFF','#00FFFF','purple']);
  rows.push(['red']);
  return rows;
}

function initializeLevel() {
  currentBGMusic = '#ChronoTheme';
  $(currentBGMusic)[0].loop=true;
  $(currentBGMusic)[0].play();
  blocksOnScreen = 0;
  var rows = level1Layout();
  for(var i=0; i<rows.length; i++) {
    var row = rows[i];
    var n = row.length;
    var blockWidth = Math.floor(windowBorder.right/n);
    var blockHeight = Math.floor(windowBorder.bottom*0.04);
    for (var j=0; j<n; j++) {
      if (row[j] != 0) {
        var block = new Block(windowBorder.right*(j/n), windowBorder.bottom * (i*0.05), blockWidth, blockHeight, row[j]);
      }
    }
  }
}

function keyWasPressed(event) {
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

$(function() {
  $(window).resize(function() {
    windowBorder.right = $(window).width();
    windowBorder.bottom = $(window).height();
  }).trigger("resize");
  $('.playerShip').draggable({axis: "x", containment: 'parent'});
  $(document).keydown(function(event) {
    keyWasPressed(event)
  });
  var ball = new Ball(20, 150, 3, 4);
  initializeLevel();
  interval = setInterval(function() {
    ball.move();
    ball.checkBorders();
    ball.checkCollision();
    }, timeDelay);
});




/////// Properties accessed by jquery /////////////////
/*<div class="ball" data-index="0" data-dx="" data-dy=""></div>

// to retrieve value
$currentBall.data("dy")
// to change value:
$currentBall.data("dy", 3)


var position = $(element).offset(); // position = { left: 42, top: 567 }
$( "p" ).offset({ top: 10, left: 30 });

css animations
@-webkit-keyframes myfirst {
    from {background: red;}
    to {background: yellow;}
}


source for ball animation:
http://bassistance.de/2011/12/09/vector-math-basics-to-animate-a-bouncing-ball-in-javascript/
*/
