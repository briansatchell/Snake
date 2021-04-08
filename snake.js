var SNAKE = {};
SNAKE.game = function(sp) {
  //init settings
  const FpsMin = 5;
  const FpsMax = 30; 
  const c = document.getElementById("canvas");
  const ctx = c.getContext("2d");
  var that = this;
  var FPS = sp.FPS || FpsMin;
  var snakes, foods, timer;
  this.getFPS = function() { return FPS; }
  this.getSnake = function() { return snakes; }
  this.getFood = function() { return foods; }
  //Set colors
  const bgColor =  '#fff';
  const canvasColor = '#000';
  const snakeHeadColor =  'green';
  const snakeBodyColor = '#fff';
  const foodColor = 'crimson';
  //borders
  const borderWidth = 45;
  const borderHeight = 45;
  //pick a direction any direction 
  const Direction = { left: 'Left', right: 'Right', up: 'Up', down: 'Down'};
  const arrows = {left: 37, up: 38, right: 39, down: 40, space: 32};
  //rng gods unite
  function getRngNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  //Get window size
  var resizeCanvas = function() {
    canvas.width = window.innerWidth - (window.innerWidth % borderWidth) - borderWidth;
    canvas.height = window.innerHeight - (window.innerHeight % borderHeight) - borderHeight*2;
  }
  // Canvas resizer
  this.init = function() {  
    if (timer) return;
    resizeCanvas();
    canvas.style.backgroundColor = canvasColor;
    document.body.style.backgroundColor = bgColor;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var headPos = getRngPosition(canvas.width, canvas.height, borderWidth, borderHeight);
    var foodPos = getRngPosition(canvas.width, canvas.height, borderWidth, borderHeight);
    var head = body({
      x: headPos.x,
      y: headPos.y,
      width: borderWidth,
      height: borderHeight,
      color: snakeHeadColor
    });
    snakes = snake({
      speed: borderWidth,
      d: null,
      queue: [head]
    });
    foods = food({
      x: foodPos.x,
      y: foodPos.y,
      width: borderWidth,
      height: borderHeight,
      color: foodColor
    });
    // Draw snake and food
    snakes.draw();
    foods.draw();
    // Resize canvas
    window.addEventListener('resize', this.init, false);
    // Keypress events listener
    window.onkeydown = function(e) {
      var code = e.keyCode ? e.keyCode : e.which;
      var currentDir = snakes.getDirection();
      //up, up, down, down, left, right, left, right, B, A
      switch (code) {
        case arrows.left:
          if (!currentDir || currentDir === Direction.up || currentDir === Direction.down) snakes.setDirection(Direction.left);
          break;
        case arrows.up: 
          if (!currentDir || currentDir === Direction.left || currentDir === Direction.right) snakes.setDirection(Direction.up);
          break;
        case arrows.right:
          if (!currentDir || currentDir === Direction.up || currentDir === Direction.down) snakes.setDirection(Direction.right);
          break;
        case arrows.down: 
          if (!currentDir || currentDir === Direction.left || currentDir === Direction.right) snakes.setDirection(Direction.down);
          break;
        default:
          break;
      }
      // Start game on press
      if (!timer && snakes.getDirection()) timer = new Timer(that.loop, 1000 / that.getFPS);
    }
  // touchscreen inputs
    touchToSwipe.init();
  }
  //touchscreen events
  var touchToSwipe = {
  	touches : {
  		"touchstart": {"x":-1, "y":-1},
  		"touchmove" : {"x":-1, "y":-1},
  		"touchend"  : false,
  		"direction" : "undetermined"
  	},
  	touchHandler: function(event) {
  		var touch;
  		if (typeof event !== 'undefined'){
  			event.preventDefault();
  			if (typeof event.touches !== 'undefined') {
  				touch = event.touches[0];
  				switch (event.type) {
  					case 'touchstart':
  					case 'touchmove':
  						touchToSwipe.touches[event.type].x = touch.pageX;
  						touchToSwipe.touches[event.type].y = touch.pageY;
  						break;
  					case 'touchend':
  						touchToSwipe.touches[event.type] = true;
  						if (touchToSwipe.touches.touchstart.x > -1 && touchToSwipe.touches.touchmove.x > -1) {
                var dx = touchToSwipe.touches.touchstart.x - touchToSwipe.touches.touchmove.x;
                var dy = touchToSwipe.touches.touchstart.y - touchToSwipe.touches.touchmove.y;
                if (Math.abs(dx) > Math.abs(dy)) {
                  touchToSwipe.touches.direction = dx < 0 ? 'right' : 'left';
                } else {
                  touchToSwipe.touches.direction = dy < 0 ? 'down' : 'up';
                }
                var currentDir = snakes.getDirection();
                switch (touchToSwipe.touches.direction) {
                  case 'left':
                    if (!currentDir || currentDir === Direction.up || currentDir === Direction.down) snakes.setDirection(Direction.left);
                    break;
                  case 'up':
                    if (!currentDir || currentDir === Direction.left || currentDir === Direction.right) snakes.setDirection(Direction.up);
                    break;
                  case 'right':
                    if (!currentDir || currentDir === Direction.up || currentDir === Direction.down) snakes.setDirection(Direction.right);
                    break;
                  case 'down':
                    if (!currentDir || currentDir === Direction.left || currentDir === Direction.right) snakes.setDirection(Direction.down);
                    break;
                  default:
                    break;
                }
                // Start game
                if (!timer && snakes.getDirection()) timer = new Timer(that.loop, 1000 / that.getFPS);
  						}
  					default:
  						break;
  				}
  			}
  		}
  	},
  	init: function() {
  		document.addEventListener('touchstart', touchToSwipe.touchHandler, false);
  		document.addEventListener('touchmove', touchToSwipe.touchHandler, false);
  		document.addEventListener('touchend', touchToSwipe.touchHandler, false);
  	}
  };
  that.loop = function() {
    timer = new Timer(that.loop, 1000 / FPS);
    // Snake movement
    var trX = 0, trY = 0;
    var speed = snakes.getSpeed();
    var prevHead = snakes.getHead();
    // No walls switch statement to move snake to otherside
    switch (snakes.getDirection()) {
      case Direction.left:
        if (prevHead.getX() - speed < 0) trX += canvas.width - borderWidth;
        else trX -= speed;
        break;
      case Direction.right:
        if (prevHead.getX() + prevHead.getWidth() + speed > canvas.width) trX -= canvas.width - borderWidth;
        else trX += speed;
        break;
      case Direction.up:
        if (prevHead.getY() - speed < 0) trY += canvas.height - borderHeight;
        else trY -= speed;
        break;
      case Direction.down:
        if (prevHead.getY() + prevHead.getHeight() + speed > canvas.height) trY -= canvas.height - borderHeight;
        else trY += speed;
        break;
      default:
        break;
    }
    //What did I hit?
    bodyCollision(prevHead, trX, trY);
    foodCollision(prevHead, trX, trY);
    // Add new headt snake
    var newHead = body({
      x: prevHead.getX() + trX,
      y: prevHead.getY() + trY,
      width: prevHead.getWidth(),
      height: prevHead.getHeight(),
      color: snakeHeadColor
    });
    snakes.addHead(newHead);
    newHead.draw();
    // Prevhead to body
    if (snakes.getLength() > 1) {
      prevHead.setColor(snakeBodyColor);
      prevHead.draw();
    }
  }
  //It's all about the snake
  var snake = function(sp) {
    var that = {};
    that.getSpeed = function() { return sp.speed; }
    that.setDirection = function(d) { sp.d = d; }
    that.getDirection = function() { return sp.d; };
    that.getQueue = function() { return sp.queue; }
    that.getHead = function() { return sp.queue[sp.queue.length-1]; }
    that.getBody = function() { return sp.queue.slice(0, sp.queue.length-1); }
    that.getLength = function() { return sp.queue.length; }
    that.draw = function() {
      for (var i = 0; i < sp.queue.length; i++) {
        sp.queue[i].draw();
      }
    };
    that.removeTail = function() {
      return sp.queue.shift();
    }
    that.addHead = function(body) {
      sp.queue.push(body);
    }
    that.containsBody = function(body) {
      for (var i = 0; i < sp.queue.length; i++) {
        if (sp.queue[i].getX() === body.getX() && sp.queue[i].getY() === body.getY()) return true;
      }
      return false;
    }
    return that;
  }
  //The more you eat the more you grow
  var body = function(sp) {
    var that = {};
    var padding = sp.padding || 2;
    that.getX = function() { return sp.x; }
    that.getY = function() { return sp.y; }
    that.getWidth = function() { return sp.width; }
    that.getHeight = function() { return sp.height; }
    that.getColor = function() { return sp.color; }
    that.setColor = function(color) { sp.color = color; }
    that.draw = function() {
      ctx.fillStyle = sp.color;
      ctx.fillRect(sp.x+padding, sp.y+padding, sp.width-padding*2, sp.height-padding*2);
    };
    that.clear = function() {
      ctx.clearRect(sp.x, sp.y, sp.width, sp.height);
    };
    return that;
  }
  //Food creation is wonderful thing 
  var food = function(sp) {
    var that = body(sp);
    var padding = sp.padding || 4;
    that.draw = function() {
      ctx.lineWidth = 2;
      ctx.fillStyle = sp.color;
      ctx.fillRect(sp.x+padding, sp.y+padding, sp.width-padding*2, sp.height-padding*2);
      ctx.stroke();
    }
    return that;
  }
  //Stop Hitting Yourself
  var bodyCollision = function(prevHead, trX, trY) {
    for (var i = 0; i < snakes.getBody().length; i++) {
      var c = snakes.getBody()[i];
      if (prevHead.getX() + trX == c.getX() && prevHead.getY() + trY == c.getY()) {
        return game_over();
      };
    }
  }
  //Chomp chomp chewy chop chop
  var foodCollision = function(prevHead, trX, trY) {
    if (prevHead.getX() + trX == foods.getX() && prevHead.getY() + trY == foods.getY()) {
      scaleFPS();
      foods.clear();
      foods = makeFood();
      foods.draw();
    } else {
      snakes.removeTail().clear();
    }
  }
  //Faster and faster we go
  var scaleFPS = function() {
    if (FPS < FpsMax) FPS += (FpsMax/FPS)*0.20;
  }
  //Chef's delight
  var makeFood = function() {
    var position = getRngPosition(canvas.width, canvas.height, borderWidth, borderHeight);
    var foods = food({
      x: position.x,
      y: position.y,
      width: borderWidth,
      height: borderHeight,
      color: foodColor
    });
    while (snakes.containsBody(foods)) return makeFood();
    return foods;
  }
  //Game Over MAN!
  var game_over = function() {
    timer.stop();
    timer = null;
    FPS = FpsMin;
    that.init();
  }
  //Randomness occurs
  function getRngPosition(width, height, xOffset, yOffset) {
    var norm = {
      width: width / borderWidth,
      height: height / borderHeight,
      xOffset: xOffset / borderWidth,
      yOffset: yOffset / borderHeight
    };
    //Where he'll go no one knows
    var position = {
      x: getRngNum(norm.xOffset, norm.width - norm.xOffset) * borderWidth,
      y: getRngNum(norm.yOffset, norm.height - norm.yOffset) * borderHeight
    };
    return position;
  }
  //Time is the great equalizer
  function Timer(callback, wait) {
    var t, timeLeft = wait;
    this.resume = function() {
      start = performance.now();
      window.clearTimeout(t);
      t = window.setTimeout(callback, timeLeft);
    };
    this.stop = function() {
      window.clearTimeout(t);
    }
    this.resume();
  };
  return that;
}
