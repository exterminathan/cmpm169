// cam rotation
let angleX = 0, angleY = 0; 

// bridge params
let bridgeLength = 150;
let bridgeWidth = 50;
let bridgeHeight = 10;
let gapSize = 75;
let unitSpacing; 
let numUnits = 100;
let loopLength;


let speed = 5; 

// Array of bridge units
let bridgeUnits = [];

function setup() {
  let canvas = createCanvas(600, 600, WEBGL);
  canvas.parent("canvas-container");

  loopLength = numUnits * gapSize;

  for (let i = 0; i < numUnits; i++) {
    bridgeUnits.push({ 
        y: i * gapSize,
        color: getColor(i)
    });
  }

  camera(0, 100, -200, 
         0, -1000, 200, 
         0, 1, 0);
}

function draw() {
  background(30);
  
  for (let i = 0; i < bridgeUnits.length; i++) {
    let unit = bridgeUnits[i];

    unit.y -= speed;

    drawBridgeUnit(unit.y, unit.color);

    if (unit.y < -loopLength / 2) {
      unit.y += loopLength;
    }

    unit.colorOffset += 0.5;
  }
}

function drawBridgeUnit(y, c) {
  push();
  translate(0, y, 0);
  drawBridgeSegment(bridgeLength, bridgeWidth, bridgeHeight, c);
  pop();
}

function drawBridgeSegment(len, wid, hght, c) {
  push();
  noStroke();
  fill(c);
  box(len, wid, hght); 
  pop();
}

function getColor(index) {
    let baseOffset = index * 0.1; 

    let r = map(sin(baseOffset), -1, 1, 139, 210); 
    let g = map(sin(baseOffset + PI / 4), -1, 1, 69, 140); 
    let b = map(sin(baseOffset + PI / 2), -1, 1, 19, 80);

    return color(r, g, b);
}
