// sketch.js - p5.js implementation of perlin noise art
// Author: Nathan Shturm
// Date: 01.20.2025

// LICENSES
/** M_1_5_03

Generative Gestaltung – Creative Coding im Web
ISBN: 978-3-87439-902-9, First Edition, Hermann Schmidt, Mainz, 2018
Benedikt Groß, Hartmut Bohnacker, Julia Laub, Claudius Lazzeroni
with contributions by Joey Lee and Niels Poldervaart
Copyright 2018

http://www.generative-gestaltung.de

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


Modified by Nathan Shturm on 1.20.2025
**/

/**
 * noise values (noise 3d) are used to animate a bunch of agents.
 *
 * KEYS
 * 1-2                 : switch noise mode
 * space               : new noise seed
 * backspace           : clear screen
 * s                   : save png
 */


// Globals
let agents = [];
let agentCount = 4000;
let noiseScale = 100; 
let noiseStrength = 10;
let noiseZRange = 0.4;
let noiseZVelocity = 0.01;
let overlayAlpha = 10;
let agentAlpha = 90;
let strokeWidth = 0.3;
let drawMode = 1;

// Canvas container globals
let canvasContainer;
let centerHorz, centerVert;
let rotationDirection = 1; 

function resizeScreen() {
    centerHorz = canvasContainer.width() / 2;
    centerVert = canvasContainer.height() / 2;
    console.log("Resizing...");
    resizeCanvas(canvasContainer.width(), canvasContainer.height());
}

//Runs once on startup
function setup() {
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");


    for (let i = 0; i < agentCount; i++) {
        agents.push({
          x: random(width),
          y: random(height),
          z: random(noiseZRange)
        });
    }

    $(window).resize(function() {
        resizeScreen();
    });
    resizeScreen();
    background(255);
}

function draw() {
  // Draw a semi-transparent overlay
  fill(255, overlayAlpha);
  noStroke();
  rect(0, 0, width, height);

  // Draw agents
  stroke(0, agentAlpha);
  for (let agent of agents) {
      let angle = noise(agent.x / noiseScale, agent.y / noiseScale, agent.z) * TWO_PI * noiseStrength;

      if (drawMode === 1) {
          strokeWeight(strokeWidth);
          point(agent.x, agent.y);
      } else if (drawMode === 2) {
          strokeWeight(strokeWidth);
          line(agent.x, agent.y, agent.x + cos(angle), agent.y + sin(angle));
      }

      // Update agent position
      agent.x += cos(angle);
      agent.y += sin(angle);
      agent.z += noiseZVelocity;

      // Wrap agents to screen boundaries
      if (agent.x < 0 || agent.x > width || agent.y < 0 || agent.y > height) {
          agent.x = random(width);
          agent.y = random(height);
          agent.z = random(noiseZRange);
      }
  }
}

function keyReleased(event) {
  if (key === 's' || key === 'S') saveCanvas('p5-noise-art', 'png');
  if (key === '1') drawMode = 1;
  if (key === '2') drawMode = 2;
  if (key === ' ') {
      event.preventDefault();
      let newNoiseSeed = floor(random(10000));
      console.log('newNoiseSeed', newNoiseSeed);
      noiseSeed(newNoiseSeed);
  }
  if (keyCode === DELETE || keyCode === BACKSPACE) background(255);
}