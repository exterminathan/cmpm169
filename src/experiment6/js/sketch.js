let floatingWords = [];
let connections = [];

let isTyping = false;
let typedWord = "";
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
    w.y -= w.speed;
    if (w.y < -100 && !w.isRemoving) w.isRemoving = true;
    if (w.isRemoving) w.removeProgress = min(w.removeProgress + w.removeSpeed, 1);
  }

  floatingWords = floatingWords.filter(w => w.removeProgress < 1);

  connections = connections.filter(conn => {
    let stillHasWord1 = conn.word1.removeProgress < 1;
    let stillHasWord2 = conn.word2.removeProgress < 1;
    return stillHasWord1 && stillHasWord2;
  });

  stroke(80, 80, 80);
  strokeWeight(1);

  for (let conn of connections) {
    conn.progress = min(conn.progress + conn.speed, 1);

    let w1 = conn.word1;
    let w2 = conn.word2;

    let centerX1 = w1.x + textWidth(w1.text) / 2;
    let centerY1 = w1.y + textAscent() / 2;
    let centerX2 = w2.x + textWidth(w2.text) / 2;
    let centerY2 = w2.y + textAscent() / 2;

    let baseProgress = conn.progress;
    let startFrac = 0;
    let endFrac = baseProgress;

    if (w1.isRemoving) startFrac = w1.removeProgress * baseProgress;
    if (w2.isRemoving) endFrac = baseProgress * (1 - w2.removeProgress);

    if (endFrac > startFrac) {
      let drawX1 = lerp(centerX1, centerX2, startFrac);
      let drawY1 = lerp(centerY1, centerY2, startFrac);
      let drawX2 = lerp(centerX1, centerX2, endFrac);
      let drawY2 = lerp(centerY1, centerY2, endFrac);
      line(drawX1, drawY1, drawX2, drawY2);
    }
  }

  noStroke();
  for (let w of floatingWords) text(w.text, w.x, w.y);

  if (millis() - lastBlink > 500) {
    cursorVisible = !cursorVisible;
    lastBlink = millis();
  }
  if (isTyping) text(typedWord + (cursorVisible ? "|" : ""), wordX, wordY);
}

function getRiseSpeed(wordText) {
  let lengthOfWord = wordText.length;

  if (lengthOfWord === 1) return 0.6;
  if (lengthOfWord >= 2 && lengthOfWord <= 4) return 0.45;
  if (lengthOfWord >= 5 && lengthOfWord <= 8) return 0.3;
  return map(lengthOfWord, 9, 20, 0.2, 0.1);
}

function setGradientBackground() {
  let c1 = color(217, 194, 240);
  let c2 = color(194, 208, 240);
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function mousePressed() {
  isTyping = true;
  typedWord = "";
  wordX = mouseX;
  wordY = mouseY;
}

function keyPressed() {
  if (isTyping) {
    if (keyCode === 13 || keyCode === 32) {
      let newWord = {
        text: typedWord,
        x: wordX,
        y: wordY,
        speed: getRiseSpeed(typedWord)*.2,
        isRemoving: false,
        removeProgress: 0,
        removeSpeed: random(0.01, 0.05)
      };

      for (let oldWord of floatingWords) {
        connections.push({
          word1: newWord,
          word2: oldWord,
          progress: 0,
          speed: random(0.01, 0.05)
        });
      }

      floatingWords.push(newWord);
      isTyping = false;
    } else if (keyCode === BACKSPACE) {
      typedWord = typedWord.slice(0, -1);
    } else if (key.length === 1) {
      typedWord += key;
    }
  }
}
