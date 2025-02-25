let mic, fft, pg, deviceSelect, vizSelect, startButton, clearButton, gainSlider;
let isVisualizationOn = true;
let inputGain = 2;
let mediaRecorder;
let recordedChunks = [];
let recordButton;
let lineColor = "#FF69B4";
let colorPicker;

window.onload = function () {
  new p5();
};

function setup() {
  let container = document.getElementById("canvas-container");
  let canvas = createCanvas(600, 400);
  canvas.parent(container);

  pg = createGraphics(width, height);
  pg.background("#222");

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

  colorPicker = createColorPicker(lineColor);
  colorPicker.parent(controls);
  colorPicker.style("margin-left", "10px");
  colorPicker.changed(changeLineColor);

  startButton = createButton("Hide Visual");
  startButton.parent(controls);
  startButton.mousePressed(toggleVisualization);
  startButton.style("background-color", "#333");
  startButton.style("color", lineColor);
  startButton.style("border", "1px solid " + lineColor);

  clearButton = createButton("Clear Audio");
  clearButton.parent(controls);
  clearButton.mousePressed(clearSpectrogram);
  clearButton.style("background-color", "#333");
  clearButton.style("color", lineColor);
  clearButton.style("border", "1px solid " + lineColor);
  clearButton.style("margin-left", "10px");

  recordButton = createButton("Record Video");
  recordButton.parent(controls);
  recordButton.mousePressed(toggleRecording);
  recordButton.style("background-color", "#333");
  recordButton.style("color", lineColor);
  recordButton.style("border", "1px solid " + lineColor);
  recordButton.style("margin-left", "10px");

  gainSlider = createSlider(1, 5, inputGain, 0.1);
  gainSlider.parent(gainControl);
  gainSlider.style("width", "100%");
  gainSlider.style("accent-color", lineColor);
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

function changeLineColor() {
  lineColor = colorPicker.value();
  gainSlider.style("accent-color", lineColor);
  startButton.style("color", lineColor);
  clearButton.style("color", lineColor);
  recordButton.style("color", lineColor);
  startButton.style("border", "1px solid " + lineColor);
  clearButton.style("border", "1px solid " + lineColor);
  recordButton.style("border", "1px solid " + lineColor);
}

function updateGain() {
  inputGain = gainSlider.value();
  mic.amp(inputGain);
}

function toggleVisualization() {
  isVisualizationOn = !isVisualizationOn;
  if (isVisualizationOn) {
    startButton.html("Hide Visual");
    startButton.style("background-color", "#333");
  } else {
    startButton.html("Show Visual");
    startButton.style("background-color", "#555");
  }
}

function clearSpectrogram() {
  pg.background("#222");
  background("#222");
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
    let t = constrain(amplitudeVal / 255, 0, 1);
    let baseColor = color(lineColor);
    let finalColor = lerpColor(color("#222"), baseColor, t);
    pg.stroke(finalColor);
    pg.point(pg.width - 1, y);
  }
  image(pg, 0, 0);
}



function drawStereometer() {
  let level = mic.getLevel() * inputGain;
  let barHeight = map(level, 0, 1, 0, height);
  noStroke();
  fill(lineColor);
  rect(0, height - barHeight, width / 2 - 10, barHeight);
  rect(width / 2 + 10, height - barHeight, width / 2 - 10, barHeight);
}

function drawWaveform() {
  background("#222");
  let waveform = fft.waveform();
  stroke(lineColor);
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
  fill(lineColor);
  for (let i = 0; i < spectrum.length; i++) {
    let x = map(i, 0, spectrum.length, 0, width);
    let h = -height + map(spectrum[i] * inputGain, 0, 255, height, 0);
    rect(x, height, width / spectrum.length, h);
  }
}

function drawOscilloscope() {
  background("#222");
  let waveform = fft.waveform();
  stroke(lineColor);
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
  background("#222");
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

function toggleRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordButton.html("Record Video");
  } else {
    startRecording();
    recordButton.html("Stop Recording");
  }
}

function startRecording() {
  recordedChunks = [];
  let canvasElement = document.querySelector("canvas");
  let stream = canvasElement.captureStream(45);
  let options = { mimeType: "video/webm; codecs=vp9" };
  mediaRecorder = new MediaRecorder(stream, options);
  mediaRecorder.ondataavailable = function (event) {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };
  mediaRecorder.onstop = saveVideo;
  mediaRecorder.start();
}

function saveVideo() {
  let blob = new Blob(recordedChunks, { type: "video/webm" });
  let url = URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "canvas_video.webm";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}
