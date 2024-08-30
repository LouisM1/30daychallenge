const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshPhongMaterial({
    color: 0xD4AF37,  // Gold color
    shininess: 60,    // Reduced shininess
    specular: 0xFFD700  // Specular highlight color
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const edgesGeometry = new THREE.EdgesGeometry(geometry);
const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
cube.add(edges);

// Increase intensity of point lights
const light1 = new THREE.PointLight(0xFFFFFF, 1.5, 100);
light1.position.set(5, 5, 5);
scene.add(light1);

const light2 = new THREE.PointLight(0xFFFFFF, 1.5, 100);
light2.position.set(-5, -5, -5);
scene.add(light2);

// Add ambient light to fill in shadows
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

camera.position.z = 5;

scene.background = new THREE.Color(0x000000);

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});