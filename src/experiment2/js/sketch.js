// sketch.js - p5.js implementation of Perlin noise art
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

class NoiseField {
  constructor(config= {}) {
      this.agentCount = config.agentCount || 4000;
      this.noiseScale = config.noiseScale || 70;
      this.noiseStrength = config.noiseStrength || 10;
      this.noiseZRange = config.noiseZRange || 0.7;
      this.noiseZVelocity = config.noiseZVelocity || 0.01;
      this.overlayAlpha = config.overlayAlpha || 2;
      this.agentAlpha = config.agentAlpha || 100;
      this.strokeWidth = config.strokeWidth || 0.5;
      this.arcRadius = config.arcRadius || 30;
      this.mouseForce = config.mouseForce || 300;
      this.drawMode = config.drawMode || 1;
      this.hueMin = config.hueMin || 0;
      this.hueMax = config.hueMax || 360;

      this.agents = [];
      this.initAgents();
  }

  initAgents() {
      this.agents = [];
      for (let i = 0; i < this.agentCount; i++) {
          this.agents.push({
              vector: createVector(random(width), random(height)),
              vectorOld: createVector(random(width), random(height)),
              stepSize: random(1, 5),
              angle: 0,
              noiseZ: random(this.noiseZRange),
              hue: random(this.hueMin, this.hueMax),
          });
      }
  }

  updateAndDraw() {
      for (let agent of this.agents) {
        if (this.drawMode === 1) {
          agent.angle = noise(agent.vector.x / this.noiseScale, agent.vector.y / this.noiseScale, agent.noiseZ) * this.noiseStrength;
        } else if (this.drawMode === 2) {
          let rawAngle = noise(agent.vector.x / this.noiseScale, agent.vector.y / this.noiseScale, agent.noiseZ) * 24;
          agent.angle = (rawAngle - floor(rawAngle)) * this.noiseStrength;
        }
  
        this.applyMouseRepulsion(agent);
        this.drawAgent(agent);
  
        agent.vector.x += cos(agent.angle) * agent.stepSize;
        agent.vector.y += sin(agent.angle) * agent.stepSize;
  
        this.wrapAgent(agent);
  
        agent.vectorOld.set(agent.vector);
        agent.noiseZ += this.noiseZVelocity;
        agent.hue = (agent.hue + 0.5) % 360;
        if (agent.hue < this.hueMin || agent.hue > this.hueMax) {
          agent.hue = random(this.hueMin, this.hueMax);
        }
      }
    }
  
    applyMouseRepulsion(agent) {
      let dx = agent.vector.x - mouseX;
      let dy = agent.vector.y - mouseY;
      let distance = sqrt(dx * dx + dy * dy);
  
      if (distance < this.mouseForce) {
        let force = (this.mouseForce - distance) / this.mouseForce;
        let fx = (dx / distance) * force * agent.stepSize;
        let fy = (dy / distance) * force * agent.stepSize;
        agent.vector.x += fx;
        agent.vector.y += fy;
      }
    }
  
    drawAgent(agent) {
      stroke(agent.hue, 80, 100, this.agentAlpha);
      strokeWeight(this.strokeWidth * agent.stepSize);
  
      if (this.drawMode === 1) {
        point(agent.vector.x, agent.vector.y);
      } else if (this.drawMode === 2) {
        let arcSpread = HALF_PI / 8;
        let midX = (agent.vectorOld.x + agent.vector.x) / 2;
        let midY = (agent.vectorOld.y + agent.vector.y) / 2;
        let arcAngle = atan2(agent.vector.y - agent.vectorOld.y, agent.vector.x - agent.vectorOld.x);
  
        noFill();
        stroke(agent.hue, 80, 100, this.agentAlpha);
        strokeWeight(this.strokeWidth);
        arc(midX, midY, this.arcRadius, this.arcRadius, arcAngle - arcSpread, arcAngle + arcSpread);
      }
    }
  
    wrapAgent(agent) {
      if (agent.vector.x < -10) {
        agent.vector.x = width + 10;
        agent.vectorOld.x = agent.vector.x;
      }
      if (agent.vector.x > width + 10) {
        agent.vector.x = -10;
        agent.vectorOld.x = agent.vector.x;
      }
      if (agent.vector.y < -10) {
        agent.vector.y = height + 10;
        agent.vectorOld.y = agent.vector.y;
      }
      if (agent.vector.y > height + 10) {
        agent.vector.y = -10;
        agent.vectorOld.y = agent.vector.y;
      }
    }
  
    setDrawMode(mode) {
      this.drawMode = mode;
    }

    setHueRange(hueMin, hueMax) {
      this.hueMin = hueMin;
      this.hueMax = hueMax;
      this.agents.forEach(agent => {
        agent.hue = random(this.hueMin, this.hueMax);
      });
    }
}


// Global variables
let fields = [];
let overlayAlpha = 2;
let canvasContainer;


// Input data Streams
let weatherdata = { temperature: 25, windSpeed: 5};
let cryptoData = { price: 30000};
let currentTime = new Date().getHours();


function updateDataStreams() {
  // use curl request to open-meteo @ current location
  //get current location from browser permissions
  $.get("https://ipinfo.io", function(response) {
    let loc = response.loc.split(",");
    let lat = loc[0];
    let lon = loc[1];
    $.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`, function(data) {
      weatherdata.temperature = data.current.temperature_2m;
      weatherdata.windSpeed = data.current.wind_speed_10m;
    });
  });

  // use curl request to coingecko @ ETH
  $.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd", function(data) {
    cryptoData.price = data.ethereum.usd;
  });

  // get current time
  currentTime = new Date().getSeconds();

  console.log(`temp: ${weatherdata.temperature}`);
  console.log(`wind: ${weatherdata.windSpeed}`);
  console.log(`price: ${cryptoData.price}`);
  console.log(`time: ${currentTime}`);
  
}

function resizeScreen() {
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
}

function setup() {
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  colorMode(HSB, 360, 100, 100, 100);
  background(255);

  // noisefield1
  fields.push(
    new NoiseField({
      agentCount: 500,
      noiseScale: 60,
      noiseStrength: 10,
      noiseZRange: 0.6,
      noiseZVelocity: 0.01,
      agentAlpha: 100,
      strokeWidth: 0.5,
      arcRadius: 30,
      mouseForce: 300,
      drawMode: 1,
      hueMin: 180,
      hueMax: 220,
    })
  );

  // noisefield2
  fields.push(
    new NoiseField({
      agentCount: 500,
      noiseScale: 80,
      noiseStrength: 12,
      noiseZRange: 1.0,
      noiseZVelocity: 0.02,
      agentAlpha: 60,
      strokeWidth: 1.0,
      arcRadius: 40,
      mouseForce: 250,
      drawMode: 1,
      hueMin: 40,
      hueMax: 40,
    })
  );

  // noisefield3
  fields.push(
    new NoiseField({
      agentCount: 500,
      noiseScale: 50,
      noiseStrength: 8,
      noiseZRange: 0.5,
      noiseZVelocity: 0.015,
      agentAlpha: 80,
      strokeWidth: 0.4,
      arcRadius: 20,
      mouseForce: 200,
      drawMode: 1,
      hueMin: 100,
      hueMax: 140,
    })
  );

  $(window).resize(function () {
    resizeScreen();
  });
  resizeScreen();
}

function draw() {
  fill(255, overlayAlpha);
  noStroke();
  rect(0, 0, width, height);

  if (frameCount % 30 === 0) updateDataStreams();

  // Mapped noiseScale and noiseStrength for first field based on temperature and wind speed
  const mapNoiseScale = map(weatherdata.temperature, -10, 40, 20, 100);
  fields[0].noiseScale = mapNoiseScale;
  const mapNoiseStrength = map(weatherdata.windSpeed, 0, 20, 5, 20);
  fields[0].noiseStrength = mapNoiseStrength;

  // Mapped agent count for second field based on crypto price
  const mapAgentCount = map(cryptoData.price, 0, 60000, 100, 1000);
  fields[1].agentCount = mapAgentCount;

  // Mapped hue for third field based on time
  const mapHue = map(currentTime, 0, 59, 0, 360);
  fields[2].setHueRange(mapHue - 20, mapHue + 20);

  // Update and redraw all fields
  fields.forEach((field) => {
    field.updateAndDraw();
  });
}


function keyReleased(event) {
  if (key === 's' || key === 'S') saveCanvas('p5-noise-art', 'png');
  if (key === '1') fields.forEach((field) => field.setDrawMode(1));
  if (key === '2') fields.forEach((field) => field.setDrawMode(2));
  if (key === ' ') {
    event.preventDefault();
    let newSeed = floor(random(10000));
    console.log('newNoiseSeed', newSeed);
    noiseSeed(newSeed);
  }
  if (keyCode === DELETE || keyCode === BACKSPACE) background(255);
}