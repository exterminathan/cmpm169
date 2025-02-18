let floatingWords = [];

let isTyping = false;
let typedWord = '';
let wordX, wordY;
let cursorVisible = true;
let lastBlink = 0;

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent("canvas-container");

  textSize(24);
  textAlign(LEFT, TOP);
  fill(255);
}

function draw() {
  setGradientBackground();

  for (let w of floatingWords) {
    text(w.text, w.x, w.y);
    w.y -= w.speed;
  }

  // blink cursor
  if (millis() - lastBlink > 500) {
    cursorVisible = !cursorVisible;
    lastBlink = millis();
  }

  if (isTyping) {
    text(typedWord + (cursorVisible ? '|' : ''), wordX, wordY);
  }
}

function setGradientBackground() {
  let c1 = color(200);
  let c2 = color(150);
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function mousePressed() {
  isTyping = true;
  typedWord = '';
  wordX = mouseX;
  wordY = mouseY;
}

function keyPressed() {
  if (isTyping) {
    if (keyCode === ENTER) {
      floatingWords.push({
        text: typedWord,
        x: wordX,
        y: wordY,
        speed: random(0.5, 2.5)
      });
      isTyping = false;
    } else if (keyCode === BACKSPACE) {
      typedWord = typedWord.slice(0, -1);
    } else if (key.length === 1) {
      typedWord += key;
    }
  }
}
