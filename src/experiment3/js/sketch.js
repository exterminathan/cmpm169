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


var maxCount = 5000;
let paused = false;

let growthSpeed = 1;
let frameCt = 0;

let rustClusters = [];
let rustAdjustRate = 0.001;

let startColor;
let endColor;

let mode = "none";

function setup() {
  canvasContainer = $('#canvas-container');
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");
  strokeWeight(0.5);
  noStroke();

  bg_color = random(200, 230);
  background(bg_color);

  startColor = color('#B76B0E');
  endColor = color('#B7330E');

  addRustCluster(width / 2, height / 2);

}


function draw() {
  // customizable speed/frame counter
  frameCt++;
  if (frameCt < growthSpeed) {
    return;
  }
  frameCt = 0;

  for (let cluster of rustClusters) {
    // add new abstract to the current cluster if possible
    if (cluster.currentCount < maxCount) {
      let newR = random(0.4, 3);
      let newX = random(newR, width - newR);
      let newY = random(newR, height - newR);

      let closestDist = Number.MAX_VALUE;
      let closestIndex = 0;

      // find the closest abstract in the cluster
      for (let i = 0; i < cluster.currentCount; i++) {
        let newDist = dist(newX, newY, cluster.x[i], cluster.y[i]);
        if (newDist < closestDist) {
          closestDist = newDist;
          closestIndex = i;
        }
      }

      // align the new abstract to the closest abstract
      let angle = atan2(newY - cluster.y[closestIndex], newX - cluster.x[closestIndex]);
      cluster.x.push(cluster.x[closestIndex] + cos(angle) * (cluster.r[closestIndex] + newR));
      cluster.y.push(cluster.y[closestIndex] + sin(angle) * (cluster.r[closestIndex] + newR));
      cluster.r.push(newR);
      cluster.rustFactors.push(0);
      cluster.currentCount++;
    }

    // draw all abstracts in the cluster
    for (let i = 0; i < cluster.currentCount; i++) {
      cluster.rustFactors[i] = min(cluster.rustFactors[i] + rustAdjustRate, 1);
      let rustColor = lerpColor(startColor, endColor, cluster.rustFactors[i]);

      fill(rustColor);
      drawAbstract(cluster.x[i], cluster.y[i], cluster.r[i]);
    }
  }
}


function mousePressed() {
  if (mode === "spray") {
    sprayWater(mouseX, mouseY, 20, 2);
  } else if (mode === "scrub") {
    scrubRust(mouseX, mouseY, 20);
  }
}

function addRustCluster(startX, startY) {
  rustClusters.push({
    x: [startX],
    y: [startY], 
    r: [1],
    rustFactors: [0],
    currentCount: 1
  });
  loop();
}


function drawAbstract(cX, cY, size) {
  beginShape();
  let numPoints = int(random(7, 13));

  for (let i = 0; i < numPoints; i++) {
    let angle = random(TWO_PI);
    let rad = size * random(0.5, 1.5);
    let x = cX + cos(angle) * rad;
    let y = cY + sin(angle) * rad;
    vertex(x, y);
  }

  endShape(CLOSE);
}

function sprayWater(x, y, radius, ct) {
  for (let i = 0; i < ct; i++) {
    let angle = random(TWO_PI);
    let distFromCenter = random(radius);
    let newX = x + cos(angle) * distFromCenter;
    let newY = y + sin(angle) * distFromCenter;

    addRustCluster(newX, newY);
  }

}

function scrubRust(x, y, radius) {
  for (let cluster of rustClusters) {
    for (let i = cluster.currentCount - 1; i >= 0; i--) {
      let d = dist(x, y, cluster.x[i], cluster.y[i]);
      if (d < radius) {
        cluster.x.splice(i, 1);
        cluster.y.splice(i, 1);
        cluster.r.splice(i, 1);
        cluster.rustFactors.splice(i, 1);
        cluster.currentCount--;
      }
    }
  }
  redrawCanvas();
}

function redrawCanvas() {
  background(bg_color);
  for (let cluster of rustClusters) {
    for (let i = 0; i < cluster.currentCount; i++) {
      let rustColor = lerpColor(startColor, endColor, cluster.rustFactors[i]);
      fill(rustColor);
      drawAbstract(cluster.x[i], cluster.y[i], cluster.r[i]);
    }
  }
}


// Canvas controls //
function keyPressed() {
  if (key === '1') {
    mode = "spray";
  } else if (key === '2') {
    mode = "scrub";
  } else if (key === 'p' || key === 'P') {
    paused = !paused;
    if (paused) {
      noLoop();
    } else {
      loop();
    }
  }
}


// resize canvas dynamically
function resizeScreen() {
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
  x[0] = width / 2;
  y[0] = height / 2;
}