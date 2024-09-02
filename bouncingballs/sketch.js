let ball;
let circle;
let lastCollisionTime = 0;
const COLLISION_COOLDOWN = 200; // milliseconds
const GROWTH_DELAY = 50; // milliseconds
const ANIMATION_DURATION = 300; // milliseconds
let isMoving = false; // New variable to track movement state
let playPauseButton; // New variable for the button
let gameEnded = false; // New variable to track game end state
let bounceCount = 0; // New variable to track number of bounces
let osc; // Oscillator for sound
const MIN_FREQ = 220; // A3 note
const MAX_FREQ = 880; // A5 note

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); // Ensure consistent pixel density across devices
  textFont('Helvetica Neue');
  
  // Initialize oscillator
  osc = new p5.Oscillator('sine');
  
  circle = new Circle(width / 2, height / 2, height * 0.375);
  
  // Spawn the ball within the upper half of the circle, away from edges
  let angle = random(PI, TWO_PI); // Restrict angle to upper half
  let minRadius = circle.r * 0.2; // Minimum 20% of circle radius
  let maxRadius = circle.r * 0.8; // Maximum 80% of circle radius
  let radius = random(minRadius, maxRadius);
  let x = circle.x + radius * cos(angle);
  let y = circle.y + radius * sin(angle);
  ball = new Ball(x, y, 40);
  
  playPauseButton = createButton('<div class="icon"></div>Start');
  playPauseButton.id('playPauseButton');
  playPauseButton.mousePressed(toggleMovement);
}

function draw() {
  clear(); // Clear the canvas before drawing
  background(0);
  
  if (!gameEnded) {
    circle.update();
    if (isMoving) {
      ball.update();
    }
  }
  
  circle.display();
  ball.display();
  
  checkGameEnd();
  
  // Display bounce count
  textAlign(LEFT, BOTTOM);
  textSize(20);
  fill(255);
  text(`Bounces: ${bounceCount}`, 20, height - 20);
}

function keyPressed() {
  if (key === ' ' && !gameEnded) {
    toggleMovement();
  }
}

function toggleMovement() {
  if (!gameEnded) {
    isMoving = !isMoving;
    playPauseButton.toggleClass('playing');
    playPauseButton.html(`<div class="icon"></div>${isMoving ? 'Stop' : 'Start'}`);
  }
}

function checkGameEnd() {
  if (ball.d >= circle.r * 2) {
    gameEnded = true;
    isMoving = false;
    playPauseButton.attribute('disabled', '');
    playPauseButton.style('opacity', '0.5');
    playPauseButton.html('<div class="icon"></div>Game Over');
    
    let resetButton = createButton('Reset');
    resetButton.class('reset-button');
    resetButton.position(width / 2 - 50, height / 2 + circle.r + 20);
    resetButton.mousePressed(() => window.location.reload());
  }
}

function resetGame() {
  gameEnded = false;
  isMoving = false;
  bounceCount = 0;
  
  circle = new Circle(width / 2, height / 2, height * 0.375);
  
  let angle = random(PI, TWO_PI);
  let minRadius = circle.r * 0.2;
  let maxRadius = circle.r * 0.8;
  let radius = random(minRadius, maxRadius);
  let x = circle.x + radius * cos(angle);
  let y = circle.y + radius * sin(angle);
  ball = new Ball(x, y, 40);
  
  playPauseButton.removeAttribute('disabled');
  playPauseButton.style('opacity', '1');
  playPauseButton.html('<div class="icon"></div>Start');
  playPauseButton.mousePressed(toggleMovement);
}

class Ball {
  constructor(x, y, d) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-5, 5), random(-5, 5));
    this.acc = createVector(0, 0.2);
    this.d = d;
    this.targetD = d;
    this.growStartTime = 0;
  }
  
  update() {
    if (isMoving) {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
    }
    this.handleCollision(circle);
    this.animateSize();
  }

  handleCollision(circle) {
    let toCenter = p5.Vector.sub(createVector(circle.x, circle.y), this.pos);
    let distanceToCenter = toCenter.mag();
    
    if (distanceToCenter + this.d / 2 > circle.r) {
      console.log("Handling collision at", millis());
      let normal = toCenter.copy().normalize();
      this.pos = p5.Vector.sub(createVector(circle.x, circle.y), p5.Vector.mult(normal, circle.r - this.d / 2));
      
      let incidence = this.vel.copy().normalize();
      let dot = incidence.dot(normal);
      let reflection = p5.Vector.sub(incidence, p5.Vector.mult(normal, 2 * dot));
      
      this.vel = reflection.mult(this.vel.mag());

      bounceCount++; // Increment bounce count

      // Play sound
      this.playCollisionSound();

      // Add resizing logic here
      if (millis() - lastCollisionTime > COLLISION_COOLDOWN) {
        console.log("Resizing triggered at", millis());
        lastCollisionTime = millis();
        circle.startShrink();
        this.startGrow();
      } else {
        console.log("Resizing ignored due to cooldown at", millis());
      }
    }
  }

  playCollisionSound() {
    let freq = map(this.pos.y, 0, height, MIN_FREQ, MAX_FREQ);
    osc.freq(freq);
    osc.start();
    osc.amp(0.5, 0.05); // Set amplitude to 0.5 over 0.05 seconds
    osc.amp(0, 0.1, 0.05); // Fade out to 0 over 0.1 seconds, starting after 0.05 seconds
  }

  display() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.d);
  }
  
  startGrow() {
    console.log("Ball starting to grow at", millis());
    this.targetD = this.d * 1.03; // 3% growth
    this.growStartTime = millis();
  }
  
  animateSize() {
    if (this.growStartTime > 0) {
      let progress = (millis() - this.growStartTime) / ANIMATION_DURATION;
      if (progress < 1) {
        this.d = lerp(this.d, this.targetD, progress);
      } else {
        console.log("Ball finished growing at", millis());
        this.d = this.targetD;
        this.growStartTime = 0;
      }
    }
  }
}

class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.targetR = r;
    this.shrinkStartTime = 0;
  }
  
  update() {
    this.animateSize();
  }
  
  display() {
    noFill();
    stroke(255);
    strokeWeight(2);
    ellipse(this.x, this.y, this.r * 2);
  }
  
  startShrink() {
    console.log("Circle starting to shrink at", millis());
    this.targetR = this.r * 0.97; // 3% shrink
    this.shrinkStartTime = millis();
  }
  
  animateSize() {
    if (this.shrinkStartTime > 0) {
      let progress = (millis() - this.shrinkStartTime) / ANIMATION_DURATION;
      if (progress < 1) {
        this.r = lerp(this.r, this.targetR, progress);
      } else {
        console.log("Circle finished shrinking at", millis());
        this.r = this.targetR;
        this.shrinkStartTime = 0;
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  circle.x = width / 2;
  circle.y = height / 2;
  circle.r = height * 0.375; // 75% of height = height * 0.75 / 2
  playPauseButton.position(width - 100, 20); // Update button position on resize
}