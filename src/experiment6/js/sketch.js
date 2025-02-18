let typedWords = [];
let typedConnections = [];
let aiWords = [];
let aiConnections = [];
let isTyping = false;
let typedWord = "";
let wordX, wordY;
let cursorVisible = true;
let lastBlink = 0;
let letterSpacingValue = 4;
let speedControl = 0.2;

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.parent("canvas-container");
  textSize(36);
  textFont("Helvetica");
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  fill(255);
}

function draw() {
  setGradientBackground();

  for (let w of typedWords) {
    w.y -= w.speed * speedControl;
    if (w.y < -100 && !w.isRemoving) {
      w.isRemoving = true;
    }
    if (w.isRemoving) {
      w.removeProgress = min(w.removeProgress + w.removeSpeed, 1);
    }
  }
  typedWords = typedWords.filter(w => w.removeProgress < 1);
  typedConnections = typedConnections.filter(conn => {
    let stillHasWord1 = conn.word1.removeProgress < 1;
    let stillHasWord2 = conn.word2.removeProgress < 1;
    return stillHasWord1 && stillHasWord2;
  });

  for (let w of aiWords) {
    w.y += w.speed * speedControl;
    if (w.y > height + 100 && !w.isRemoving) {
      w.isRemoving = true;
    }
    if (w.isRemoving) {
      w.removeProgress = min(w.removeProgress + w.removeSpeed, 1);
    }
  }
  aiWords = aiWords.filter(w => w.removeProgress < 1);
  aiConnections = aiConnections.filter(conn => {
    let stillHasWord1 = conn.word1.removeProgress < 1;
    let stillHasWord2 = conn.word2.removeProgress < 1;
    return stillHasWord1 && stillHasWord2;
  });

  stroke(120, 120, 120);
  strokeWeight(1);
  for (let conn of typedConnections) {
    conn.progress = min(conn.progress + conn.speed, 1);
    let w1 = conn.word1;
    let w2 = conn.word2;
    let centerX1 = w1.x + getCustomTextWidth(w1.text) / 2;
    let centerY1 = w1.y + textAscent() / 2;
    let centerX2 = w2.x + getCustomTextWidth(w2.text) / 2;
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

  stroke(180, 80, 80);
  strokeWeight(1);
  for (let conn of aiConnections) {
    conn.progress = min(conn.progress + conn.speed, 1);
    let w1 = conn.word1;
    let w2 = conn.word2;
    let centerX1 = w1.x + getCustomTextWidth(w1.text) / 2;
    let centerY1 = w1.y + textAscent() / 2;
    let centerX2 = w2.x + getCustomTextWidth(w2.text) / 2;
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
  fill(255);
  for (let w of typedWords) {
    drawTextWithSpacing(w.text, w.x, w.y);
  }
  fill(255, 150, 150);
  for (let w of aiWords) {
    drawTextWithSpacing(w.text, w.x, w.y);
  }

  if (millis() - lastBlink > 500) {
    cursorVisible = !cursorVisible;
    lastBlink = millis();
  }

  if (isTyping) {
    fill(255);
    drawTextWithSpacing(typedWord + (cursorVisible ? "|" : ""), wordX, wordY);
  }
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

async function getRelatedWord(inputWord) {
  const url = `https://api.datamuse.com/words?ml=${encodeURIComponent(inputWord)}&max=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      return data[0].word;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Datamuse request failed:", err);
    return null;
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
        speed: getRiseSpeed(typedWord) * speedControl,
        isRemoving: false,
        removeProgress: 0,
        removeSpeed: random(0.01, 0.05)
      };
      for (let oldWord of typedWords) {
        typedConnections.push({
          word1: newWord,
          word2: oldWord,
          progress: 0,
          speed: random(0.01, 0.05)
        });
      }
      typedWords.push(newWord);
      isTyping = false;
      getRelatedWord(typedWord).then(aiResponse => {
        if (aiResponse) {
          let aiNewWord = {
            text: aiResponse,
            x: random(0, width),
            y: random(0, height/2),
            speed: getRiseSpeed(aiResponse) * speedControl,
            isRemoving: false,
            removeProgress: 0,
            removeSpeed: random(0.01, 0.05)
          };
          for (let oldAI of aiWords) {
            aiConnections.push({
              word1: aiNewWord,
              word2: oldAI,
              progress: 0,
              speed: random(0.01, 0.05)
            });
          }
          aiWords.push(aiNewWord);
        }
      });
    } else if (keyCode === BACKSPACE) {
      typedWord = typedWord.slice(0, -1);
    } else if (key.length === 1) {
      typedWord += key;
    }
  }
}

function drawTextWithSpacing(txt, x, y) {
  let currentX = x;
  for (let i = 0; i < txt.length; i++) {
    let ch = txt.charAt(i);
    text(ch, currentX, y);
    currentX += textWidth(ch) + letterSpacingValue;
  }
}

function getCustomTextWidth(txt) {
  let w = 0;
  for (let i = 0; i < txt.length; i++) {
    w += textWidth(txt.charAt(i));
    if (i < txt.length - 1) w += letterSpacingValue;
  }
  return w;
}

document.addEventListener("DOMContentLoaded", function () {
  let speedSlider = document.getElementById("speedSlider");
  let speedValue = document.getElementById("speedValue");

  speedSlider.addEventListener("input", function () {
    speedControl = parseFloat(speedSlider.value);
    speedValue.textContent = speedSlider.value;
  });
});
