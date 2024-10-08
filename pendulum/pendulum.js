const canvas = document.getElementById('pendulumCanvas');
const ctx = canvas.getContext('2d');

// Get input elements
const length1Input = document.getElementById('length1');
const length2Input = document.getElementById('length2');
const mass1Input = document.getElementById('mass1');
const mass2Input = document.getElementById('mass2');
const startButton = document.getElementById('startButton');
const speedInput = document.getElementById('speed');

// Pendulum parameters
const g = 9.81; // Gravity
let l1, l2, m1, m2, centerX, centerY;
let speedMultiplier = 70; // Initial speed value
let tracePoints = [];
let isTracing = false;

let isAnimating = false;

// Initialize pendulum
function initPendulum() {
    l1 = l2 = 175; // Set initial lengths to 175 pixels
    m1 = m2 = 20;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    
    // Update input values
    length1Input.value = length2Input.value = l1.toFixed(0);
    mass1Input.value = mass2Input.value = m1.toFixed(0);
    speedInput.value = "300";
    updateSpeed();
}

let a1 = Math.PI / 2, a2 = Math.PI / 2; // Initial angles
let a1_v = 0, a2_v = 0; // Initial angular velocities

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 150;
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
    initPendulum();
    drawPendulum();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Add event listeners to inputs
length1Input.addEventListener('input', updateParameters);
length2Input.addEventListener('input', updateParameters);
mass1Input.addEventListener('input', updateParameters);
mass2Input.addEventListener('input', updateParameters);
speedInput.addEventListener('input', updateSpeed);

function updateParameters() {
    const inputs = [length1Input, length2Input, mass1Input, mass2Input, speedInput];
    let hasError = false;

    inputs.forEach(input => {
        const value = input.value === '' ? null : parseFloat(input.value);
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);

        if (value !== null && (isNaN(value) || value > max)) {
            showError(`${input.id.charAt(0).toUpperCase() + input.id.slice(1)} must be between ${min} and ${max}`);
            hasError = true;
        }
    });

    if (!hasError) {
        hideError();
        l1 = length1Input.value === '' ? parseFloat(length1Input.min) : Math.max(parseFloat(length1Input.value), parseFloat(length1Input.min));
        l2 = length2Input.value === '' ? parseFloat(length2Input.min) : Math.max(parseFloat(length2Input.value), parseFloat(length2Input.min));
        m1 = mass1Input.value === '' ? parseFloat(mass1Input.min) : Math.max(parseFloat(mass1Input.value), parseFloat(mass1Input.min));
        m2 = mass2Input.value === '' ? parseFloat(mass2Input.min) : Math.max(parseFloat(mass2Input.value), parseFloat(mass2Input.min));
        if (!isAnimating) {
            drawPendulum();
        }
    }
}

function updateSpeed() {
    speedMultiplier = parseFloat(speedInput.value) / 5;
    if (!isAnimating) {
        drawPendulum();
    }
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

    // Calculate positions without scaling
    let x1 = centerX + l1 * Math.sin(a1);
    let y1 = centerY + l1 * Math.cos(a1);
    let x2 = x1 + l2 * Math.sin(a2);
    let y2 = y1 + l2 * Math.cos(a2);

    // Set glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';

    if (isTracing) {
        // Draw trace
        ctx.beginPath();
        ctx.moveTo(tracePoints[0]?.x, tracePoints[0]?.y);
        for (let point of tracePoints) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.strokeStyle = traceColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Add current point to trace
        tracePoints.push({x: x2, y: y2});
        if (tracePoints.length > 10000) {
            tracePoints.shift();
        }
    }

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

    // Reset shadow properties
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
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
    if (!isAnimating) return;

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

startButton.addEventListener('click', () => {
    if (!isAnimating) {
        isAnimating = true;
        isTracing = true;
        startButton.textContent = 'Stop';
        lastTime = 0; // Reset lastTime when starting
        requestAnimationFrame(animate);
    } else {
        isAnimating = false;
        startButton.textContent = 'Start';
    }
});

drawPendulum();

const toggleNumber = document.getElementById('toggleNumber');
const toggleSlider = document.getElementById('toggleSlider');
const inputControls = document.querySelector('.input-controls');

function toggleInput(activeButton) {
    toggleNumber.classList.toggle('active', activeButton === toggleNumber);
    toggleSlider.classList.toggle('active', activeButton === toggleSlider);
    
    const isNumberActive = activeButton === toggleNumber;
    inputControls.querySelectorAll('input').forEach(input => {
        const currentValue = input.value;
        if (isNumberActive) {
            input.type = 'number';
            input.step = input.id === 'speed' ? '1' : '0.1';
        } else {
            input.type = 'range';
        }
        input.value = currentValue;
        
        // Set min and max attributes for both number and range inputs
        input.min = input.getAttribute('min');
        input.max = input.getAttribute('max');
    });
}

toggleNumber.addEventListener('click', () => toggleInput(toggleNumber));
toggleSlider.addEventListener('click', () => toggleInput(toggleSlider));

let isDragging = false;
let draggedPendulum = null;
let isHovering = false;

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', endDrag);
canvas.addEventListener('mouseleave', endDrag);

function handleMouseMove(e) {
    if (isDragging) {
        drag(e);
    } else {
        hover(e);
    }
}

function startDrag(e) {
    if (isAnimating) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const x1 = centerX + l1 * Math.sin(a1);
    const y1 = centerY + l1 * Math.cos(a1);
    const x2 = x1 + l2 * Math.sin(a2);
    const y2 = y1 + l2 * Math.cos(a2);

    const dist1 = Math.sqrt((mouseX - x1) ** 2 + (mouseY - y1) ** 2);
    const dist2 = Math.sqrt((mouseX - x2) ** 2 + (mouseY - y2) ** 2);

    if (dist1 < m1 + 5) {
        isDragging = true;
        draggedPendulum = 1;
        canvas.classList.add('dragging');
    } else if (dist2 < m2 + 5) {
        isDragging = true;
        draggedPendulum = 2;
        canvas.classList.add('dragging');
    }
}

function drag(e) {
    if (!isDragging || isAnimating) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (draggedPendulum === 1) {
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        a1 = Math.atan2(dx, dy);
    } else if (draggedPendulum === 2) {
        const x1 = centerX + l1 * Math.sin(a1);
        const y1 = centerY + l1 * Math.cos(a1);
        const dx = mouseX - x1;
        const dy = mouseY - y1;
        a2 = Math.atan2(dx, dy);
    }

    drawPendulum();
}

function endDrag() {
    isDragging = false;
    draggedPendulum = null;
    canvas.classList.remove('dragging');
    if (!isHovering) {
        canvas.classList.remove('hovering');
    }
}

function hover(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const x1 = centerX + l1 * Math.sin(a1);
    const y1 = centerY + l1 * Math.cos(a1);
    const x2 = x1 + l2 * Math.sin(a2);
    const y2 = y1 + l2 * Math.cos(a2);

    const dist1 = Math.sqrt((mouseX - x1) ** 2 + (mouseY - y1) ** 2);
    const dist2 = Math.sqrt((mouseX - x2) ** 2 + (mouseY - y2) ** 2);

    if (dist1 < m1 + 5 || dist2 < m2 + 5) {
        if (!isHovering) {
            isHovering = true;
            canvas.classList.add('hovering');
        }
    } else {
        if (isHovering) {
            isHovering = false;
            canvas.classList.remove('hovering');
        }
    }
}

function getRandomColor() {
    const hue = Math.random() * 360;
    const saturation = 100;
    const lightness = 50 + Math.random() * 10;
    return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`;
}

let traceColor = getRandomColor();

function resetPendulum() {
    a1 = Math.PI / 2;
    a2 = Math.PI / 2;
    a1_v = 0;
    a2_v = 0;
    isAnimating = false;
    isTracing = false;
    startButton.textContent = 'Start';
    tracePoints = [];
    traceColor = getRandomColor(); // Add this line
    initPendulum();
    drawPendulum();
}

const resetButton = document.getElementById('resetButton');
resetButton.addEventListener('click', resetPendulum);

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
}

function hideError() {
    const errorElement = document.getElementById('error-message');
    errorElement.classList.remove('visible');
}

// Set initial state to number inputs
toggleInput(toggleNumber);