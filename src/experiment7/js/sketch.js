let mic, fft, pg, deviceSelect, startButton, clearButton;
let isVisualizationOn = true; // Controls whether data is displayed

window.onload = function () {
  new p5();
};

function setup() {
  let container = document.getElementById("canvas-container");

  if (!container) {
    console.error("Error: #canvas-container not found!");
    return;
  }

  let canvas = createCanvas(600, 400);
  canvas.parent(container);

  pg = createGraphics(width, height);
  pg.background(0);

  let controls = document.getElementById("controls");
  if (!controls) {
    console.error("Error: #controls not found!");
    return;
  }

  deviceSelect = createSelect();
  deviceSelect.parent(controls);
  deviceSelect.changed(deviceChanged);

  // Toggle Visualization Button
  startButton = createButton("Hide Spectrogram");
  startButton.parent(controls);
  startButton.mousePressed(toggleVisualization);
  startButton.style("background-color", "#121212");
  startButton.style("color", "#fff");

  // Clear Audio Button
  clearButton = createButton("Clear Audio");
  clearButton.parent(controls);
  clearButton.mousePressed(clearSpectrogram);
  clearButton.style("background-color", "#444");
  clearButton.style("color", "#fff");
  clearButton.style("margin-left", "10px");

  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then(gotDevices);
  }

  // Always keep mic running
  mic = new p5.AudioIn();
  mic.start(() => {
    fft = new p5.FFT();
    fft.setInput(mic);
  });
}

function toggleVisualization() {
  isVisualizationOn = !isVisualizationOn;
  if (isVisualizationOn) {
    startButton.html("Hide Spectrogram");
    startButton.style("background-color", "#121212");
  } else {
    startButton.html("Show Spectrogram");
    startButton.style("background-color", "#333");
  }
}

// Clears the spectrogram at any time
function clearSpectrogram() {
  pg.background(0);
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
  if (mic) {
    mic.stop();
  }
  mic = new p5.AudioIn();
  mic.start({ deviceId: deviceId }, () => {
    fft.setInput(mic);
  });
}

function draw() {
  if (!fft) return;

  background(0);

  // If visualization is off, don't update the display
  if (!isVisualizationOn) {
    image(pg, 0, 0);
    return;
  }

  // Shift spectrogram left
  pg.copy(pg, 1, 0, pg.width - 1, pg.height, 0, 0, pg.width - 1, pg.height);

  let spectrum = fft.analyze();

  for (let y = 0; y < pg.height; y++) {
    let index = floor(map(y, 0, pg.height, spectrum.length - 1, 0));
    let amplitudeVal = spectrum[index];
    pg.stroke(color(amplitudeVal));
    pg.point(pg.width - 1, y);
  }

  image(pg, 0, 0);
}
