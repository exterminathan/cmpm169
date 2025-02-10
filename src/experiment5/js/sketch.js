let angleY = 0;
let cameraRotation = 0;

let bridges = [];
const numBridges = 12;

class Bridge {
  constructor(options) {
    // core params
    this.numUnits = options.numUnits || 100;
    this.gapSize = options.gapSize || 75;
    this.loopLength = this.numUnits * this.gapSize;
    this.speed = options.speed || 5;
    this.bridgeWidth = options.bridgeWidth || 50;
    this.bridgeHeight = options.bridgeHeight || 10;

    // wave params
    this.waveAmplitude = options.waveAmplitude || 30;
    this.waveSpeed = options.waveSpeed || 0.05;
    this.wavePhaseOffset = options.wavePhaseOffset || 0.3;
    this.lerpSpeed = options.lerpSpeed || 0.1;

    this.position = options.position || createVector(0, 0, 0);
    this.scale = options.scale || 1;

    this.flowDir = options.flowDir;
    this.waveDir = options.waveDir;

    this.hueStart = random(0, 360);
    this.hueRange = random(90, 180); 
    this.sat = random(50, 100);
    this.bri = random(70, 100);

    this.units = [];
    for (let i = 0; i < this.numUnits; i++) {
      let t = i * this.gapSize - this.loopLength / 2;
      this.units.push({
        t: t,
        offset: 0,
        len: 50,
        color: color(0, 100, 100)
      });
    }
  }

  update(mouseOffset, dynamicMaxLen) {
    for (let i = 0; i < this.units.length; i++) {
      let unit = this.units[i];

      let wave = -sin(mouseOffset * this.waveSpeed + i * this.wavePhaseOffset) * this.waveAmplitude;
      let targetOffset = mouseOffset + wave;
      unit.offset = lerp(unit.offset, targetOffset, this.lerpSpeed);

      let targetLen = map(unit.t, -this.loopLength / 2, this.loopLength / 2, 50, dynamicMaxLen);
      unit.len = lerp(unit.len, targetLen, this.lerpSpeed);

      let hueValue = map(unit.t, -this.loopLength / 2, this.loopLength / 2,
                         this.hueStart, this.hueStart + this.hueRange);
      hueValue = (hueValue + 360) % 360;


      unit.color = color(hueValue, 100, 100);

      unit.t -= this.speed;
      while (unit.t < -this.loopLength / 2) {
        unit.t += this.loopLength;
      }
    }
  }

  draw() {
    push();
    translate(this.position.x, this.position.y, this.position.z);
    scale(this.scale);

    for (let i = 0; i < this.units.length; i++) {
      let unit = this.units[i];
      push();
      let flowPos = p5.Vector.mult(this.flowDir, unit.t);
      let wavePos = p5.Vector.mult(this.waveDir, unit.offset);
      let finalPos = p5.Vector.add(flowPos, wavePos);

      translate(finalPos.x, finalPos.y, finalPos.z);

      drawBridgeSegment(unit.len, this.bridgeWidth, this.bridgeHeight, unit.color);
      drawRecursivePattern(unit.len, this.bridgeWidth, this.bridgeHeight, 2, unit.color);
      pop();
    }
    pop();
  }
}

function drawBridgeSegment(len, wid, hght, c) {
  push();
  noStroke();
  fill(c);
  box(len, wid, hght);
  pop();
}

function drawRecursivePattern(len, wid, hght, depth, baseColor) {
  if (depth <= 0) return;
  push();
  translate(0, -hght / 2, 0);

  let newLen = len * 0.5;
  let newWid = wid * 0.5;
  let newHght = hght * 0.5;

  let h = (hue(baseColor) + 30) % 360;
  let s = saturation(baseColor);
  let b = brightness(baseColor);
  let newColor = color(h, s, b);

  noStroke();
  fill(newColor);
  box(newLen, newWid, newHght);

  drawRecursivePattern(newLen, newWid, newHght, depth - 1, newColor);
  pop();
}

function setup() {
  let canvas = createCanvas(600, 600, WEBGL);
  canvas.parent("canvas-container");
  colorMode(HSB, 360, 100, 100);

  perspective(PI / 3, width / height, 1, 5000);

  for (let i = 0; i < numBridges; i++) {
    let theta = random(TWO_PI);
    let phi = random(0, PI);
    let x = sin(phi) * cos(theta);
    let y = sin(phi) * sin(theta);
    let z = cos(phi);
    let flowDir = createVector(x, y, z);

    let randVec = createVector(random(-1, 1), random(-1, 1), random(-1, 1));
    let crossVec = randVec.cross(flowDir);
    let tries = 0;
    while (crossVec.mag() < 0.001 && tries < 10) {
      randVec = createVector(random(-1, 1), random(-1, 1), random(-1, 1));
      crossVec = randVec.cross(flowDir);
      tries++;
    }
    crossVec.normalize();

    let options = {
      numUnits: 40,
      gapSize: random(50, 80),
      speed: random(3, 7),
      bridgeWidth: random(50, 80),
      bridgeHeight: random(5, 10),
      waveAmplitude: random(20, 40),
      waveSpeed: random(0.03, 0.07),
      wavePhaseOffset: random(0.2, 0.4),
      lerpSpeed: 0.1,
      position: createVector(
        random(-200, 200),
        random(-200, 200),
        random(-200, 200)
      ),
      scale: random(0.8, 1.4),
      flowDir: flowDir,
      waveDir: crossVec
    };
    bridges.push(new Bridge(options));
  }

  camera(0, 0, 1000, 0, 0, 0, 0, 1, 0);
}

function draw() {
  background(240);

  angleY += cameraRotation;
  let radius = 1000;
  let camX = radius * sin(angleY);
  let camZ = radius * cos(angleY);
  camera(camX, 300, camZ, 0, 0, 0, 0, 1, 0);

  let mouseOffset = map(mouseX, 0, width, 200, -200);
  let dynamicMaxLen = map(constrain(mouseY, 0, height), 0, height, 50, 180);

  for (let i = 0; i < bridges.length; i++) {
    bridges[i].update(mouseOffset, dynamicMaxLen);
    bridges[i].draw();
  }
}

function keyPressed() {
  if (key === 'Q' || key === 'q') {
    cameraRotation = -0.02;
  } else if (key === 'E' || key === 'e') {
    cameraRotation = 0.02;
  }
}

function keyReleased() {
  if (key === 'Q' || key === 'q' || key === 'E' || key === 'e') {
    cameraRotation = 0;
  }
}
