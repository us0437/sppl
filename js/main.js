// Initialize 3D model
function initModel() {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 5;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(document.getElementById('model-container').clientWidth, 
                     document.getElementById('model-container').clientHeight);
    document.getElementById('model-container').appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    
    // Create steel frame structure
    createSteelFrame(scene);
    
    // Add sensors to the structure
    addSensors(scene);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const width = document.getElementById('model-container').clientWidth;
        const height = document.getElementById('model-container').clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
}

// Create steel frame structure
function createSteelFrame(scene) {
    const material = new THREE.MeshStandardMaterial({ color: 0x7a7a7a });
    
    // Create columns
    const columnGeometry = new THREE.BoxGeometry(0.5, 10, 0.5);
    
    // Bottom layer columns
    const positions = [
        [-5, 0, -5], [5, 0, -5], [-5, 0, 5], [5, 0, 5]
    ];
    
    positions.forEach(pos => {
        const column = new THREE.Mesh(columnGeometry, material);
        column.position.set(pos[0], pos[1] + 5, pos[2]);
        scene.add(column);
    });
    
    // Create beams
    const beamGeometry = new THREE.BoxGeometry(10.5, 0.5, 0.5);
    const beamGeometryZ = new THREE.BoxGeometry(0.5, 0.5, 10.5);
    
    // X-direction beams (bottom)
    const beamXBottom1 = new THREE.Mesh(beamGeometry, material);
    beamXBottom1.position.set(0, 0, -5);
    scene.add(beamXBottom1);
    
    const beamXBottom2 = new THREE.Mesh(beamGeometry, material);
    beamXBottom2.position.set(0, 0, 5);
    scene.add(beamXBottom2);
    
    // Z-direction beams (bottom)
    const beamZBottom1 = new THREE.Mesh(beamGeometryZ, material);
    beamZBottom1.position.set(-5, 0, 0);
    scene.add(beamZBottom1);
    
    const beamZBottom2 = new THREE.Mesh(beamGeometryZ, material);
    beamZBottom2.position.set(5, 0, 0);
    scene.add(beamZBottom2);
    
    // X-direction beams (top)
    const beamXTop1 = new THREE.Mesh(beamGeometry, material);
    beamXTop1.position.set(0, 10, -5);
    scene.add(beamXTop1);
    
    const beamXTop2 = new THREE.Mesh(beamGeometry, material);
    beamXTop2.position.set(0, 10, 5);
    scene.add(beamXTop2);
    
    // Z-direction beams (top)
    const beamZTop1 = new THREE.Mesh(beamGeometryZ, material);
    beamZTop1.position.set(-5, 10, 0);
    scene.add(beamZTop1);
    
    const beamZTop2 = new THREE.Mesh(beamGeometryZ, material);
    beamZTop2.position.set(5, 10, 0);
    scene.add(beamZTop2);
    
    // Add floor
    const floorGeometry = new THREE.BoxGeometry(11, 0.2, 11);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, -0.1, 0);
    scene.add(floor);
}

// Add sensors to the structure
function addSensors(scene) {
    const sensorGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const sensorMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
    // Sensor positions
    const sensorPositions = [
        [-5, 2, -5],   // Sensor 1 - Bottom left corner
        [5, 2, -5],    // Sensor 2 - Bottom right corner
        [-5, 2, 5],    // Sensor 3 - Top left corner
        [5, 2, 5],     // Sensor 4 - Top right corner
        [0, 10, 0]     // Sensor 5 - Center top
    ];
    
    sensorPositions.forEach((pos, index) => {
        const sensor = new THREE.Mesh(sensorGeometry, sensorMaterial);
        sensor.position.set(pos[0], pos[1], pos[2]);
        sensor.userData = { id: index + 1 };
        scene.add(sensor);
        
        // Add sensor label
        const div = document.createElement('div');
        div.className = 'sensor-label';
        div.textContent = `Sensor ${index + 1}`;
        div.style.position = 'absolute';
        div.style.color = 'white';
        div.style.padding = '2px 6px';
        div.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        div.style.borderRadius = '4px';
        div.style.fontSize = '12px';
        div.style.pointerEvents = 'none';
        document.getElementById('model-container').appendChild(div);
    });
}

// Redirect to sensor page
function redirectToSensor() {
    const sensorSelect = document.getElementById('sensor-select');
    const sensorId = sensorSelect.value;
    
    if (sensorId) {
        window.location.href = `sensor.html?id=${sensorId}`;
    }
}

// Update temperature and humidity randomly (for demo)
function updateEnvironmentData() {
    const tempElement = document.getElementById('temperature');
    const humidityElement = document.getElementById('humidity');
    
    // Random temperature between 25-32°C
    const temperature = (25 + Math.random() * 7).toFixed(1);
    // Random humidity between 50-80%
    const humidity = Math.floor(50 + Math.random() * 30);
    
    tempElement.textContent = `${temperature}°C`;
    humidityElement.textContent = `${humidity}%`;
}

// Update environment data every 5 seconds
setInterval(updateEnvironmentData, 5000);

// Initialize everything when the page loads
window.onload = function() {
    initModel();
    updateEnvironmentData();
};
