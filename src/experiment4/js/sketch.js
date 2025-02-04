// edge detection using live camera feed
// by Nathan Shturm

let video;
let destination; 

let thresholdSlider, thicknessSlider, colorPicker;
let thresholdValueDisplay, thicknessValueDisplay;

let fadeAlpha = 1;
let tintAlpha = 50;
let manualColor = false;
let resetButton;

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('canvas-container');
  pixelDensity(1);

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  destination = createImage(width, height);

   // get sliders
   thresholdSlider = select('#thresholdSlider');
   thicknessSlider = select('#thicknessSlider'); 
   colorPicker = select('#colorPicker');

   // get slider values
   thresholdValueDisplay = select('#thresholdValue');
   thicknessValueDisplay = select('#thicknessValue');

   // update slider values
   thresholdSlider.input(() => {
     thresholdValueDisplay.html(thresholdSlider.value());
   });

   thicknessSlider.input(() => {
     thicknessValueDisplay.html(thicknessSlider.value());
   });
  
  colorPicker.input(() => { manualColor = true; });
  resetButton = createButton('Reset Cycle');
  resetButton.parent(colorPicker.parent());
  resetButton.mousePressed(() => { manualColor = false; });
}

function draw() {
  noStroke();
  fill(0, fadeAlpha);
  rect(0, 0, width, height);

  // read current control values
  let thresholdVal = parseInt(thresholdSlider.value());
  let thicknessVal = parseInt(thicknessSlider.value());
  let edgeColorHex = colorPicker.value();
  let edgeColor = color(edgeColorHex);
  if (!manualColor) {
    let r = sin(frameCount * 0.02) * 127 + 128;
    let g = sin(frameCount * 0.02 + TWO_PI / 3) * 127 + 128;
    let b = sin(frameCount * 0.02 + 2 * TWO_PI / 3) * 127 + 128;
    edgeColor = color(r, g, b);
  }
  
  video.loadPixels();
  destination.loadPixels();

  let w = video.width;
  let h = video.height;

  
  // binary edge mask
  let edgeMask = new Array(w * h).fill(0);

  // compute edge diffs
  for (let y = 0; y < h; y++) {
    for (let x = 1; x < w; x++) {
      let loc = (x + y * w) * 4;
      let leftLoc = ((x - 1) + y * w) * 4;
      
      let r = video.pixels[loc];
      let g = video.pixels[loc + 1];
      let b = video.pixels[loc + 2];
      
      let rLeft = video.pixels[leftLoc];
      let gLeft = video.pixels[leftLoc + 1];
      let bLeft = video.pixels[leftLoc + 2];
      
      let diff = abs((r + g + b) / 3 - (rLeft + gLeft + bLeft) / 3);
      
      if (diff > thresholdVal) {
        edgeMask[x + y * w] = 1;
      }
    }
  }
  
  // create thicker edge mask based on original edge mask
  let thickMask = new Array(w * h).fill(0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (edgeMask[x + y * w] === 1) {
        for (let dy = -thicknessVal; dy <= thicknessVal; dy++) {
          for (let dx = -thicknessVal; dx <= thicknessVal; dx++) {
            let nx = x + dx;
            let ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              thickMask[nx + ny * w] = 1;
            }
          }
        }
      }
    }
  }
  
  // draw end image
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let index = (x + y * w) * 4;
      if (thickMask[x + y * w] === 1) {
        destination.pixels[index] = red(edgeColor);
        destination.pixels[index + 1] = green(edgeColor);
        destination.pixels[index + 2] = blue(edgeColor);
        destination.pixels[index + 3] = 255;
      } else {
        destination.pixels[index] = 0;
        destination.pixels[index + 1] = 0;
        destination.pixels[index + 2] = 0;
        destination.pixels[index + 3] = 255;
      }
    }
  }
  
  destination.updatePixels();
  
  push();
  translate(width/2, height/2);
  imageMode(CENTER);
  let seg = int(map(sin(frameCount * 0.005), -1, 1, 6, 18));
  let spinSpeed = map(sin(frameCount * 0.003), -1, 1, 0.005, 0.02);
  let angleOffset = frameCount * spinSpeed;
  let spiralCount = int(map(cos(frameCount * 0.004), -1, 1, 4, 12));
  for (let ring = 0; ring < spiralCount; ring++) {
    let r = map(ring, 0, spiralCount, 0, sqrt(sq(width/2) + sq(height/2)));
    for (let k = 0; k < seg; k++) {
      push();
      rotate(2 * angleOffset + TWO_PI * k / seg);
      translate(r, 0);
      if (k % 2 === 1) { scale(-1, 1); }
      image(destination, 0, 0, width/seg, height/seg);
      pop();
    }
  }
  pop();
}
