// edge detection using live camera feed
// by Nathan Shturm

let video;
let destination; 

let thresholdSlider, thicknessSlider, colorPicker;
let thresholdValueDisplay, thicknessValueDisplay;

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
}

function draw() {
  // read current control values
  let thresholdVal = parseInt(thresholdSlider.value());
  let thicknessVal = parseInt(thicknessSlider.value());
  let edgeColorHex = colorPicker.value();
  let edgeColor = color(edgeColorHex);
  
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
        // set surrounding pixels based on thickness
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
  
  // Draw end image
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let index = (x + y * w) * 4;
      if (thickMask[x + y * w] === 1) {
        destination.pixels[index]     = red(edgeColor);
        destination.pixels[index + 1] = green(edgeColor);
        destination.pixels[index + 2] = blue(edgeColor);
        destination.pixels[index + 3] = 255;
      } else {
        //bg color
        destination.pixels[index]     = 0;
        destination.pixels[index + 1] = 0;
        destination.pixels[index + 2] = 0;
        destination.pixels[index + 3] = 255;
      }
    }
  }
  
  destination.updatePixels();
  image(destination, 0, 0);
}