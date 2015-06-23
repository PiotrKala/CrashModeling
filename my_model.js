// Matter module aliases
//
var Engine = Matter.Engine,
    World = Matter.World,
    Events = Matter.Events,
    Body = Matter.Body,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint,
    Composites = Matter.Composites,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint;

// Brick default properties
//
var DOT_SIZE = 20;
var X_START_POS = 230;
var Y_START_POS = 210;
var AIR_FRICTION = 0.01;
var FRICTION = 1.9;
var RESTITUTION = 0;
var SLOP = 0.3;
var MASS = 0.225;
var forceMagnitude = 0.02;

var dataSet = [
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK",
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK",
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK",
    "BK","BK","BK","BL","BL","BL","BK","BK","BK","BK","BL","BL","BL","BK","BK","BK",
    "BK","BK","BK","BL","BL","BL","BK","BK","BK","BK","BL","BL","BL","BK","BK","BK",
    "BK","BK","BK","BL","BL","BL","BK","BK","BK","BK","BL","BL","BL","BK","BK","BK",
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK",
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK",
    "BK","BK","BK","BL","BL","BL","BK","BK","BK","BK","BL","BL","BL","BK","BK","BK",
    "BK","BK","BK","BL","BL","BL","BK","BK","BK","BK","BL","BL","BL","BK","BK","BK",
    "BK","BK","BK","BL","BL","BL","BK","BK","BK","BK","BL","BL","BL","BK","BK","BK",
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK",
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK",
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK",
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK",
    "BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK","BK",
];

function getRgbColor(colorType) {
    var colorHash = {
        "BK":"#000000", // black
        "WH":"#FFFFFF", // white
        "BG":"#FFCCCC", // beige
        "BR":"#800000", // brown
        "RD":"#FF0000", // red
        "YL":"#FFFF00", // yellow
        "GN":"#00FF00", // green
        "WT":"#00FFFF", // water
        "BL":"#0000FF", // blue
        "PR":"#800080"  // purple
    };
    return colorHash[colorType];
}

function clearStack() {
  Matter.Composite.clear(stack, false);
}

function clearBallWithRope() {
  World.remove(engine.world, ball);
  World.remove(engine.world, ballRope);
}

function addStack() {
  World.add(engine.world, [stack]);
}

function updateStack() {
  clearStack();
  stack = prepareStack(false);
  addStack();
}

var explosionTime = 0;

void function reBuild() {
  clearBallWithRope();
  updateStack();
  createBallWithRope();
  addBallWithRope();
  resetTotalLoss();
}

function createBall() {
 return Bodies.circle(200, 400, 30, { density: 1, frictionAir: 0.001});
}

function createRope() {
  return Constraint.create({       
    pointA: { x: 200, y: 200 },            
    bodyB: ball                            
  });                                      
}

function createBallWithRope() {
  ball = createBall();
  ballRope = createRope();
}

function addBallWithRope() {
  World.add(engine.world, [ball, ballRope]);
}

function preparePlaceholders() {
  document.getElementById('brickSize').placeholder = DOT_SIZE
  document.getElementById('airFriction').placeholder = AIR_FRICTION
  document.getElementById('friction').placeholder = FRICTION
  document.getElementById('elasticity').placeholder = RESTITUTION
  document.getElementById('slop').placeholder = SLOP
  document.getElementById('mass').placeholder = MASS
  document.getElementById('force').placeholder = forceMagnitude
}

function prepareStack(defaultStack) {
  var i = 0;
  var dotSize = defaultStack ? DOT_SIZE : (document.getElementById('brickSize').value || DOT_SIZE)
  var airFriction = defaultStack ? AIR_FRICTION : (document.getElementById('airFriction').value || AIR_FRICTION)
  var friction = defaultStack ? FRICTION : (document.getElementById('friction').value || FRICTION)
  var elasticity = defaultStack ? RESTITUTION : (document.getElementById('elasticity').value || RESTITUTION)
  var slop = defaultStack ? SLOP : (document.getElementById('slop').value || SLOP)
  var mass = defaultStack ? MASS : (document.getElementById('mass').value || MASS)
  stack = Composites.stack(X_START_POS, Y_START_POS, 16, 16, 0, 0, function(x, y, column, row) {
    var color = dataSet[i++];
    var style = getRgbColor(color);
    var bodyOptions = {
      frictionAir: airFriction, 
      friction: friction,
      restitution: elasticity,
      slop: slop,
      mass: mass,
      inrseMass: 1 / mass,
      render: { fillStyle:style }
    };
      return Bodies.rectangle(x, y, dotSize, dotSize, bodyOptions);
  });
  return stack;
}

function brickIsInRange(brickPosition, xRangeLeft, xRangeRight, yRangeDown, yRangeUp) {
  return brickPosition.x <= xRangeRight && brickPosition.x >= xRangeLeft && brickPosition.y <= yRangeUp && brickPosition.y >= yRangeDown
}

function findNearbyBricks(mousePosition) {
  var chosenBodies = [];
  var bodies = stack.bodies;
  var xRangeLeft = mousePosition.x - (DOT_SIZE - 2);
  var xRangeRight = mousePosition.x + (DOT_SIZE - 2);
  var yRangeDown = mousePosition.y - (DOT_SIZE - 2);
  var yRangeUp = mousePosition.y + (DOT_SIZE - 2);
  console.log('mousePosX ' + mousePosition.x + ' mousePosY ' + mousePosition.y);
  console.log('xRangeLeft ' + xRangeLeft);
  console.log('xRangeRight ' + xRangeRight);
  console.log('yRangeDown ' + yRangeDown);
  console.log('yRangeUp ' + yRangeUp);
  var j = 0;

  for (var i = 0; i < bodies.length; i++) {
      var body = bodies[i];
      if (brickIsInRange(body.position, xRangeLeft, xRangeRight, yRangeDown, yRangeUp)) {
        chosenBodies[j++] = body;
        body.render.fillStyle = getRgbColor("RD");
        console.log(body.position + ' ' + body.id);
      }
   }
  console.log(chosenBodies);
  return chosenBodies;
}

var bodiesNearby = [];
var bodiesNearbyIndex = 0;

function clearExplosives() {
  bodiesNearby = [];
}

function updateForce() {
  forceMagnitude = document.getElementById("force").value
}

function plantExplosive(mousePosition) {
  var foundBricks = findNearbyBricks(mousePosition);
  bodiesNearby[bodiesNearbyIndex++] = foundBricks;
}

function explosion() {
  explosionTime = new Date().getTime();
  for (var i = 0; i < bodiesNearby.length; i++) {
      var bricksSet = bodiesNearby[i];
      var xDirection = 0;
      var yDirection = 0;

      for(var j = 0; j < bricksSet.length; j++) {
        body = bricksSet[j];
        if (!body.isStatic) {

          if (j == 0) {
            xDirection = -1;
            yDirection = -1;
          } else if (j == 1) {
            xDirection = 1;
            yDirection = -1;
          } else if (j == 2) {
            xDirection = -1;
            yDirection = 1;
          } else if (j == 3) {
            xDirection = 1;
            yDirection = 1;
          }

          Body.applyForce(body, { x: 0, y: 0 }, { 
              x: forceMagnitude * xDirection, 
              y: forceMagnitude * yDirection
          });
        }
      }
  }
};

function createEngine() {
  return Engine.create(document.body, {
    render: {
      options: {
        showAngleIndicator: false,
        wireframes: false
      }
    }
  });
}

preparePlaceholders();
var engine = createEngine();
var stack = prepareStack(true);
var ball = createBall();
var ballRope = createRope();

// add a mouse controlled constraint
var mouseConstraint = MouseConstraint.create(engine);
World.add(engine.world, mouseConstraint);

// create the ground the stack will sit on
var ground = Bodies.rectangle(400, 550, 800, 100, { isStatic: true });

// valuable elements
var valuableElements = [];
valuableElements.push(Bodies.rectangle(100, 530, 20, 20));
valuableElements.push(Bodies.rectangle(650, 530, 50, 50));
valuableElements.push(Bodies.rectangle(600, 530, 50, 50));
valuableElements.push(Bodies.rectangle(100, 510, 20, 20));
valuableElements.push(Bodies.rectangle(130, 510, 20, 20));

var monetaryValues = new Object();
monetaryValues[valuableElements[0].id]=500;
monetaryValues[valuableElements[1].id]=666;
monetaryValues[valuableElements[2].id]=150;
monetaryValues[valuableElements[3].id]=340;
monetaryValues[valuableElements[4].id]=541;
var alreadyDestroyed = new Object();
for (var j = 0; j < valuableElements.length; j++){
	alreadyDestroyed[valuableElements[j].id] = false;
}


function getMonetaryValue(k){
	return monetaryValues[k];
}

// Add monetary loss
var totalLoss = 0;

function resetTotalLoss(){
	totalLoss = 0;
	for (var j = 0; j < valuableElements.length; j++){
		alreadyDestroyed[valuableElements[j].id] = false;
	}
	console.log('Value reset. Total loss now: ' + totalLoss);
    explosionTime = 0;
    updateTotalLoss();
}

function valuableElementDestroy(elem){
	totalLoss+=getMonetaryValue(elem.id);
	alreadyDestroyed[elem.id] = true;
	console.log('Valuable element destroyed! Total loss now: ' + totalLoss);
    updateTotalLoss();
}

function updateTotalLoss(){
    document.getElementById("currentLoss").innerHTML = totalLoss + " $";
    var currTime = new Date().getTime();
    if (currTime - explosionTime < 10000 || explosionTime == 0){
        document.getElementById("loss10s").innerHTML = totalLoss + " $";
    if (currTime - explosionTime < 5000 || explosionTime == 0){
        document.getElementById("loss5s").innerHTML = totalLoss + " $";
        }
    }
}

Events.on(engine, 'collisionStart', function(event) {
	var pairs = event.pairs;
    if (explosionTime > 0){
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            for (var j = 0; j < valuableElements.length; j++){
                if (pair.bodyA == valuableElements[j] && !alreadyDestroyed[pair.bodyA.id]){
                    valuableElementDestroy(pair.bodyA);
                } else if (pair.bodyB == valuableElements[j] && !alreadyDestroyed[pair.bodyB.id]){
                    valuableElementDestroy(pair.bodyB);
                }				
            }
        }
    }
})

Events.on(mouseConstraint, 'mousedown', function(event) {
  plantExplosive(event.mouse.position);
})

World.add(engine.world, [ground, stack, ball, ballRope]);
World.add(engine.world, valuableElements)
Engine.run(engine);
