let mic, fft, pg, deviceSelect, vizSelect, startButton, clearButton, gainSlider;
let isVisualizationOn = true;
let inputGain = 2;

window.onload = function () {
  new p5();
};

function setup() {
  let container = document.getElementById("canvas-container");
  let canvas = createCanvas(600, 400);
  canvas.parent(container);

  pg = createGraphics(width, height); // Fixed: createGraphics() requires two arguments
  pg.background(0);
  let controls = document.getElementById("controls");
  let gainControl = document.getElementById("input-gain");

  deviceSelect = createSelect();
  deviceSelect.parent(controls);
  deviceSelect.changed(deviceChanged);

  vizSelect = createSelect();
  vizSelect.parent(controls);
  vizSelect.option("Spectrogram");
  vizSelect.option("Waveform");
  vizSelect.option("Spectrum");
  vizSelect.option("Oscilloscope");
  vizSelect.option("Stereometer");

  startButton = createButton("Hide Visual");
  startButton.parent(controls);
  startButton.mousePressed(toggleVisualization);
  startButton.style("background-color", "#121212");
  startButton.style("color", "#fff");

  clearButton = createButton("Clear Audio");
  clearButton.parent(controls);
  clearButton.mousePressed(clearSpectrogram);
  clearButton.style("background-color", "#444");
  clearButton.style("color", "#fff");
  clearButton.style("margin-left", "10px");


  gainSlider = createSlider(1, 5, inputGain, 0.1);
  gainSlider.parent(gainControl);
  gainSlider.style("width", "100%");
  gainSlider.input(updateGain);

  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then(gotDevices);
  }

  mic = new p5.AudioIn();
  mic.start(() => {
    fft = new p5.FFT();
    fft.setInput(mic);
    mic.amp(inputGain);
  });
}

function updateGain() {
  inputGain = gainSlider.value();
  mic.amp(inputGain);
}

function toggleVisualization() {
  isVisualizationOn = !isVisualizationOn;
  if (isVisualizationOn) {
    startButton.html("Hide Visual");
    startButton.style("background-color", "#121212");
  } else {
    startButton.html("Show Visual");
    startButton.style("background-color", "#333");
  }
}

function clearSpectrogram() {
  pg.background(0);
  background(0);
}

function gotDevices(deviceInfos) {
  for (let i = 0; i < deviceInfos.length; i++) {
    if (deviceInfos[i].kind === "audioinput") {
      let label = deviceInfos[i].label || `Mic ${i + 1}`;
      deviceSelect.option(label, deviceInfos[i].deviceId);
    }
  }
}

function deviceChanged() {
  let deviceId = deviceSelect.value();
  if (mic) { mic.stop(); }
  mic = new p5.AudioIn();
  mic.start({ deviceId: deviceId }, () => {
    fft.setInput(mic);
    mic.amp(inputGain);
  });
}

function drawSpectrogram() {
  pg.copy(pg, 1, 0, pg.width - 1, pg.height, 0, 0, pg.width - 1, pg.height);
  let spectrum = fft.analyze();
  for (let y = 0; y < pg.height; y++) {
    let index = floor(map(y, 0, pg.height, spectrum.length - 1, 0));
    let amplitudeVal = spectrum[index] * inputGain / 2;
    pg.stroke(color(amplitudeVal));
    pg.point(pg.width - 1, y);
  }
  image(pg, 0, 0);
}

function drawStereometer() {
  let level = mic.getLevel() * inputGain;
  let leftBarHeight = map(level, 0, 1, 0, height);
  let rightBarHeight = leftBarHeight;
  noStroke();
  fill(0, 255, 0);
  rect(0, height - leftBarHeight, width / 2 - 10, leftBarHeight);
  fill(0, 0, 255);
  rect(width / 2 + 10, height - rightBarHeight, width / 2 - 10, rightBarHeight);
}

function drawWaveform() {
  background(0);
  let waveform = fft.waveform();
  stroke(255);
  strokeWeight(3);
  noFill();
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i] * inputGain, -1, 1, height * 0.2, height * 0.8);
    vertex(x, y);
  }
  endShape();
}

function drawSpectrum() {
  let spectrum = fft.analyze();
  noStroke();
  for (let i = 0; i < spectrum.length; i++) {
    let x = map(i, 0, spectrum.length, 0, width);
    let h = -height + map(spectrum[i] * inputGain, 0, 255, height, 0);
    fill(255, 0, 0);
    rect(x, height, width / spectrum.length, h);
  }
}

function drawOscilloscope() {
  background(0);
  let waveform = fft.waveform();
  stroke(255, 255, 0);
  strokeWeight(3);
  noFill();
  beginShape();
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i] * inputGain, -1, 1, height * 0.2, height * 0.8);
    vertex(x, y);
  }
  endShape();
}

function draw() {
  if (!fft) return;
  background(0);
  if (!isVisualizationOn) { image(pg, 0, 0); return; }
  let vizType = vizSelect.value();
  if (vizType === "Spectrogram") {
    drawSpectrogram();
  } else if (vizType === "Stereometer") {
    drawStereometer();
  } else if (vizType === "Waveform") {
    drawWaveform();
  } else if (vizType === "Spectrum") {
    drawSpectrum();
  } else if (vizType === "Oscilloscope") {
    drawOscilloscope();
  }
}
