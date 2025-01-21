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


Modified by Nathan Shturm on 1.20
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
let noiseScale = 70; 
let noiseStrength = 10;
let noiseZRange = 0.7;
let noiseZVelocity = 0.01;
let overlayAlpha = 2;
let agentAlpha = 100;
let strokeWidth = .5;
let drawMode = 1;
let arcRadius = 30;
let mouseForce = 600;

// Canvas container globals
let canvasContainer;

function resizeScreen() {
    resizeCanvas(canvasContainer.width(), canvasContainer.height());
}

// Runs once on startup
function setup() {
    canvasContainer = $("#canvas-container");
    let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
    canvas.parent("canvas-container");

    // Initialize agents
    for (let i = 0; i < agentCount; i++) {
        agents.push({
            vector: createVector(random(width), random(height)),
            vectorOld: createVector(random(width), random(height)),
            stepSize: random(1, 5),
            angle: 0,
            noiseZ: random(noiseZRange),
            hue: random(200, 240) // Initialize hue for coloring
        });
    }

    $(window).resize(function () {
        resizeScreen();
    });
    resizeScreen();
    colorMode(HSB, 360, 100, 100, 100);
    background(255);
}

function draw() {
  // Draw a semi-transparent overlay
  fill(255, overlayAlpha);
  noStroke();
  rect(0, 0, width, height);

  // Draw agents
  // Source: most of the following math comes from Agent.js in the original project
  // 
  for (let agent of agents) {
      if (drawMode === 1) {
          agent.angle = noise(agent.vector.x / noiseScale, agent.vector.y / noiseScale, agent.noiseZ) * noiseStrength;
      } else if (drawMode === 2) {
          let rawAngle = noise(agent.vector.x / noiseScale, agent.vector.y / noiseScale, agent.noiseZ) * 24;
          agent.angle = (rawAngle - floor(rawAngle)) * noiseStrength;
      }

      // Mouse repulsion
      let dx = agent.vector.x - mouseX;
      let dy = agent.vector.y - mouseY;
      let distance = sqrt(dx * dx + dy * dy);

      if (distance < mouseForce) {
          let force = (mouseForce - distance) / mouseForce;
          let fx = (dx / distance) * force * agent.stepSize;
          let fy = (dy / distance) * force * agent.stepSize;
          agent.vector.x += fx;
          agent.vector.y += fy;
      }

      // Draw agents based on draw mode
      stroke(agent.hue, 80, 100, agentAlpha);
      strokeWeight(strokeWidth * agent.stepSize);

      if (drawMode === 1) {
          point(agent.vector.x, agent.vector.y);
      } else if (drawMode === 2) {
        // arcs form instead of lines
        let arcSpread = HALF_PI / 8;
    
        let midX = (agent.vectorOld.x + agent.vector.x) / 2;
        let midY = (agent.vectorOld.y + agent.vector.y) / 2;
    
        let arcAngle = atan2(agent.vector.y - agent.vectorOld.y, agent.vector.x - agent.vectorOld.x);
    
        // Draw the arc
        stroke(agent.hue, 80, 100, agentAlpha);
        noFill();
        strokeWeight(strokeWidth);
        arc(midX, midY, arcRadius, arcRadius, arcAngle - arcSpread, arcAngle + arcSpread);
    }

      // Update agent position
      agent.vector.x += cos(agent.angle) * agent.stepSize;
      agent.vector.y += sin(agent.angle) * agent.stepSize;

      // Wrap agents to screen boundaries
      if (agent.vector.x < -10) agent.vector.x = agent.vectorOld.x = width + 10;
      if (agent.vector.x > width + 10) agent.vector.x = agent.vectorOld.x = -10;
      if (agent.vector.y < -10) agent.vector.y = agent.vectorOld.y = height + 10;
      if (agent.vector.y > height + 10) agent.vector.y = agent.vectorOld.y = -10;

      // Update old position for smooth trails
      agent.vectorOld.set(agent.vector);

      // Increment noise Z value for dynamic movement
      agent.noiseZ += noiseZVelocity;

      // Increment hue for gradient effect
      agent.hue = (agent.hue + 0.5) % 360;
      if (agent.hue < 200) agent.hue = 200;
  }
}


function keyReleased(event) {
    if (key === 's' || key === 'S') saveCanvas('p5-noise-art', 'png');
    if (key === '1') {
        drawMode = 1;
    }
    if (key === '2') {
        drawMode = 2;
    }
    if (key === ' ') {
        event.preventDefault();
        let newNoiseSeed = floor(random(10000));
        console.log('newNoiseSeed', newNoiseSeed);
        noiseSeed(newNoiseSeed);
    }
    if (keyCode === DELETE || keyCode === BACKSPACE) background(255);
}
