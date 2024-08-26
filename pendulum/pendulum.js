const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');

// Get input elements
const length1Input = document.getElementById('length1');
const length2Input = document.getElementById('length2');
const mass1Input = document.getElementById('mass1');
const mass2Input = document.getElementById('mass2');

// Pendulum parameters
const g = 9.81; // Gravity
let l1, l2, m1, m2, centerX, centerY;
const speedMultiplier = 70; // Adjust this value to change the speed

// Initialize pendulum
function initPendulum() {
    const minDimension = Math.min(canvas.width, canvas.height);
    l1 = l2 = minDimension * 0.2;
    m1 = m2 = 10;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    
    // Update input values
    length1Input.value = length2Input.value = l1;
    mass1Input.value = mass2Input.value = m1;
}

let a1 = Math.PI / 2, a2 = Math.PI / 2; // Initial angles
let a1_v = 0, a2_v = 0; // Initial angular velocities

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initPendulum();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Add event listeners to inputs
length1Input.addEventListener('input', updateParameters);
length2Input.addEventListener('input', updateParameters);
mass1Input.addEventListener('input', updateParameters);
mass2Input.addEventListener('input', updateParameters);

function updateParameters() {
    l1 = parseInt(length1Input.value);
    l2 = parseInt(length2Input.value);
    m1 = parseInt(mass1Input.value);
    m2 = parseInt(mass2Input.value);
}

function updatePendulum(dt) {
    dt *= speedMultiplier; // Apply speed multiplier
    const k1 = derivatives(a1, a2, a1_v, a2_v);
    const k2 = derivatives(
        a1 + k1.a1_v * dt / 2, a2 + k1.a2_v * dt / 2,
        a1_v + k1.a1_a * dt / 2, a2_v + k1.a2_a * dt / 2
    );
    const k3 = derivatives(
        a1 + k2.a1_v * dt / 2, a2 + k2.a2_v * dt / 2,
        a1_v + k2.a1_a * dt / 2, a2_v + k2.a2_a * dt / 2
    );
    const k4 = derivatives(
        a1 + k3.a1_v * dt, a2 + k3.a2_v * dt,
        a1_v + k3.a1_a * dt, a2_v + k3.a2_a * dt
    );

    a1 += (k1.a1_v + 2 * k2.a1_v + 2 * k3.a1_v + k4.a1_v) * dt / 6;
    a2 += (k1.a2_v + 2 * k2.a2_v + 2 * k3.a2_v + k4.a2_v) * dt / 6;
    a1_v += (k1.a1_a + 2 * k2.a1_a + 2 * k3.a1_a + k4.a1_a) * dt / 6;
    a2_v += (k1.a2_a + 2 * k2.a2_a + 2 * k3.a2_a + k4.a2_a) * dt / 6;
}

function derivatives(a1, a2, a1_v, a2_v) {
    const delta = a1 - a2;
    const den1 = (m1 + m2) * l1 - m2 * l1 * Math.cos(delta) * Math.cos(delta);
    const den2 = (l2 / l1) * den1;

    const a1_a = (-g * (m1 + m2) * Math.sin(a1) - m2 * g * Math.sin(a1 - 2 * a2)
                - 2 * Math.sin(delta) * m2 * (a2_v * a2_v * l2 + a1_v * a1_v * l1 * Math.cos(delta)))
                / (l1 * den1);

    const a2_a = (2 * Math.sin(delta) * (a1_v * a1_v * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(a1)
                + a2_v * a2_v * l2 * m2 * Math.cos(delta)))
                / (l2 * den2);

    return { a1_v, a2_v, a1_a, a2_a };
}

function drawPendulum() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawCircle();

    // Calculate positions
    let x1 = centerX + l1 * Math.sin(a1);
    let y1 = centerY + l1 * Math.cos(a1);
    let x2 = x1 + l2 * Math.sin(a2);
    let y2 = y1 + l2 * Math.cos(a2);

    // Draw lines
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw masses
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x1, y1, m1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x2, y2, m2, 0, 2 * Math.PI);
    ctx.fill();
}

function drawCircle() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, l1 + l2, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

let lastTime = 0;

function animate(currentTime) {
    if (lastTime === 0) {
        lastTime = currentTime;
    }

    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    updateParameters();
    updatePendulum(deltaTime);
    drawPendulum();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);