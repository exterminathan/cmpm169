// Edge detection using live camera feed

let video;
let destination; // Destination image

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('canvas-container');
  pixelDensity(1);

  // Start the webcam feed
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  destination = createImage(width, height);
}

function draw() {
  video.loadPixels();
  destination.loadPixels();

  if (video.pixels.length > 0) {
    for (let x = 1; x < video.width; x++) {
      for (let y = 0; y < video.height; y++) {
        let loc = (x + y * video.width) * 4;

        let r = video.pixels[loc];
        let g = video.pixels[loc + 1];
        let b = video.pixels[loc + 2];

        let leftLoc = ((x - 1) + y * video.width) * 4;
        let rleft = video.pixels[leftLoc];
        let gleft = video.pixels[leftLoc + 1];
        let bleft = video.pixels[leftLoc + 2];

        let diff = abs((r + g + b) / 3 - (rleft + gleft + bleft) / 3);
        destination.pixels[loc] = diff;
        destination.pixels[loc + 1] = diff;
        destination.pixels[loc + 2] = diff;
        destination.pixels[loc + 3] = 255; //alpha
      }
    }

    destination.updatePixels();
    image(destination, 0, 0);
  }
}
