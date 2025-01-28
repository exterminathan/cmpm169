// P_2_2_4_01
//
// Generative Gestaltung – Creative Coding im Web
// ISBN: 978-3-87439-902-9, First Edition, Hermann Schmidt, Mainz, 2018
// Benedikt Groß, Hartmut Bohnacker, Julia Laub, Claudius Lazzeroni
// with contributions by Joey Lee and Niels Poldervaart
// Copyright 2018
//
// http://www.generative-gestaltung.de
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Modified by Nathan Shturm on 1.27


'use strict';


let canvasContainer;
let bg_color;


var maxCount = 5000; // max count of the cirlces
var currentCount = 1;

let growthSpeed = 1;
let frameCt = 0;

var x = [];
var y = [];
var r = [];

let rustFactors = [];
let rustAdjustRate = 0.001;
let startColor;
let endColor;

function setup() {
  canvasContainer = $('#canvas-container');
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  strokeWeight(0.5);
  noStroke();

  bg_color = random(150, 220);
  background(bg_color);

  startColor = color('#B76B0E');
  endColor = color('#B7330E');

  initRustFormation(width / 2, height / 2);

}


function draw() {
  // customizable speed/frame counter
  frameCt++;
  if (frameCt < growthSpeed) {
    return;
  }
  frameCt = 0; // Reset counter after growth

  // Add a new circle if possible
  if (currentCount < maxCount) {
    var newR = random(.4, 3);
    var newX = random(newR, width - newR);
    var newY = random(newR, height - newR);

    var closestDist = Number.MAX_VALUE;
    var closestIndex = 0;

    // Find the closest circle
    for (var i = 0; i < currentCount; i++) {
      var newDist = dist(newX, newY, x[i], y[i]);
      if (newDist < closestDist) {
        closestDist = newDist;
        closestIndex = i;
      }
    }

    // Align it to the closest circle outline
    var angle = atan2(newY - y[closestIndex], newX - x[closestIndex]);
    x[currentCount] = x[closestIndex] + cos(angle) * (r[closestIndex] + newR);
    y[currentCount] = y[closestIndex] + sin(angle) * (r[closestIndex] + newR);
    r[currentCount] = newR;
    rustFactors[currentCount] = 0;
    currentCount++;
  }

  // Draw all circles
  for (var i = 0; i < currentCount; i++) {
    rustFactors[i] = min(rustFactors[i] + rustAdjustRate, 1);
    let rustColor = lerpColor(startColor, endColor, rustFactors[i]);

    fill(rustColor);
    ellipse(x[i], y[i], r[i] * 2, r[i] * 2);
  }

  if (currentCount >= maxCount) noLoop();
}

function initRustFormation(startX, startY) {
  x = [startX];
  y = [startY];
  r = [1];
  rustFactors = [0];
  currentCount = 1;
  loop();
}


function keyReleased() {
  if (key == 's' || key == 'S') saveCanvas(gd.timestamp(), 'png');
}


// resize canvas dynamically
function resizeScreen() {
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  x[0] = width / 2;
  y[0] = height / 2;
}