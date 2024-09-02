let ball;
let circle;
let lastCollisionTime = 0;
const COLLISION_COOLDOWN = 200; // milliseconds

function setup() {
  createCanvas(windowWidth, windowHeight);
  circle = new Circle(width / 2, height / 2, min(width, height) / 2);
  ball = new Ball(random(circle.x - circle.r, circle.x + circle.r), random(circle.y - circle.r, circle.y + circle.r), 20);
}

function draw() {
  background(0);
  
  circle.display();
  ball.update();
  ball.display();
  
  if (ball.hits(circle) && millis() - lastCollisionTime > COLLISION_COOLDOWN) {
    ball.bounce(circle);
    circle.shrink();
    ball.grow();
    lastCollisionTime = millis();
  }
}

class Ball {
  constructor(x, y, d) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-5, 5), random(-5, 5));
    this.acc = createVector(0, 0.2);
    this.d = d;
  }
  
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
  }
  
  display() {
    fill(255);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.d);
  }
  
  hits(circle) {
    let distance = dist(this.pos.x, this.pos.y, circle.x, circle.y);
    return distance + this.d / 2 > circle.r;
  }
  
  bounce(circle) {
    let toCenter = p5.Vector.sub(createVector(circle.x, circle.y), this.pos);
    let normal = toCenter.copy().normalize();
    let distanceToEdge = toCenter.mag() - (circle.r - this.d / 2);
    
    // Move ball back to circle edge
    this.pos.add(p5.Vector.mult(normal, distanceToEdge));
    
    // Calculate reflection
    let incidence = this.vel.copy().normalize();
    let dot = incidence.dot(normal);
    let reflection = p5.Vector.sub(incidence, p5.Vector.mult(normal, 2 * dot));
    
    // Set new velocity with less energy loss
    this.vel = reflection.mult(this.vel.mag() * 0.99);
  }
  
  grow() {
    this.d *= 1.1; // 10% growth
  }
}

class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }
  
  display() {
    noFill();
    stroke(255);
    strokeWeight(2);
    ellipse(this.x, this.y, this.r * 2);
  }
  
  shrink() {
    this.r *= 0.98; // Reduced shrink to 2%
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  circle.x = width / 2;
  circle.y = height / 2;
  circle.r = min(width, height) / 2;
}