// --- 1. CONFIGURATION 3D CYBERPUNK (THREE.JS) ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- GROUPES DE PORTAILS HOLOGRAPHIQUES MULTI-COUCHES ---
const portalGroup = new THREE.Group();
scene.add(portalGroup);

// 1. Anneau extérieur principal (techno wireframe)
const outerGeo = new THREE.TorusGeometry(2.2, 0.04, 16, 120);
const outerMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
const outerRing = new THREE.Mesh(outerGeo, outerMat);
portalGroup.add(outerRing);

// 2. Anneau intermédiaire (dentelé/technologique)
const midGeo = new THREE.TorusGeometry(1.8, 0.08, 8, 30);
const midMat = new THREE.MeshBasicMaterial({ color: 0x7000ff, wireframe: false });
const midRing = new THREE.Mesh(midGeo, midMat);
portalGroup.add(midRing);

// 3. Anneau intérieur rotatif rapide
const innerGeo = new THREE.TorusGeometry(1.3, 0.03, 16, 80);
const innerMat = new THREE.MeshBasicMaterial({ color: 0x00ff66, wireframe: true });
const innerRing = new THREE.Mesh(innerGeo, innerMat);
portalGroup.add(innerRing);

// Noyau central complexe (Icosaèdre imbriqué)
const coreGeo = new THREE.IcosahedronGeometry(0.8, 1);
const coreMat = new THREE.MeshStandardMaterial({ 
    color: 0x00f3ff, 
    wireframe: true, 
    emissive: 0x002244,
    roughness: 0.1
});
const core = new THREE.Mesh(coreGeo, coreMat);
portalGroup.add(core);

// Cœur interne plasma
const plasmaGeo = new THREE.SphereGeometry(0.4, 32, 32);
const plasmaMat = new THREE.MeshBasicMaterial({ color: 0xff0055, wireframe: false, transparent: true, opacity: 0.8 });
const plasma = new THREE.Mesh(plasmaGeo, plasmaMat);
portalGroup.add(plasma);

// Éclairage dynamique
const pointLight = new THREE.PointLight(0x00f3ff, 3, 50);
pointLight.position.set(0, 0, 4);
scene.add(pointLight);
const ambientLight = new THREE.AmbientLight(0x111122, 1);
scene.add(ambientLight);

// CHAMP DE PARTICULES CYBERPUNK (400 étoiles d'énergie)
const particlesCount = 500;
const positions = new Float32Array(particlesCount * 3);
for(let i=0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
}
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMat = new THREE.PointsMaterial({ color: 0x00f3ff, size: 0.05, transparent: true, opacity: 0.7 });
const particleSystem = new THREE.Points(particleGeo, particleMat);
scene.add(particleSystem);

camera.position.z = 5;

// Variables de rotation fluide
let targetRotationX = 0;
let targetRotationY = 0;

// ANIMATION COMPLEXE MULTI-AXES
function animate() {
    requestAnimationFrame(animate);

    // Rotations croisées ultra-fluides des anneaux
    outerRing.rotation.z += 0.01;
    outerRing.rotation.x += 0.005;
    
    midRing.rotation.z -= 0.015;
    midRing.rotation.y += 0.01;

    innerRing.rotation.z += 0.025;
    
    core.rotation.y += 0.03;
    core.rotation.x += 0.015;

    plasma.scale.set(
        1 + Math.sin(Date.now() * 0.005) * 0.15,
        1 + Math.sin(Date.now() * 0.005) * 0.15,
        1 + Math.sin(Date.now() * 0.005) * 0.15
    );

    particleSystem.rotation.y -= 0.001;

    // Effet d'inertie (Lerp) sur l'inclinaison globale
    portalGroup.rotation.x += (targetRotationX - portalGroup.rotation.x) * 0.1;
    portalGroup.rotation.y += (targetRotationY - portalGroup.rotation.y) * 0.1;

    renderer.render(scene, camera);
}
animate();

// --- 2. CONTRÔLE SOURIS (PC) & GYROSCOPE (IPHONE) ---
const permBtn = document.getElementById('permBtn');
const statusText = document.getElementById('statusText');

window.addEventListener('mousemove', (e) => {
    const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    targetRotationY = mouseX * 0.6;
    targetRotationX = -mouseY * 0.6;
});

permBtn.addEventListener('click', async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const response = await DeviceOrientationEvent.requestPermission();
            if (response === 'granted') {
                activateGyro();
            } else {
                statusText.innerText = "Accès gyroscope refusé";
            }
        } catch (e) {
            statusText.innerText = "Erreur capteur : " + e;
        }
    } else {
        activateGyro();
    }
});

function activateGyro() {
    permBtn.style.display = 'none';
    statusText.innerText = "Hologramme synchronisé aux capteurs";
    window.addEventListener('deviceorientation', (event) => {
        if (event.beta !== null && event.gamma !== null) {
            targetRotationX = event.beta * 0.025;
            targetRotationY = event.gamma * 0.025;
        }
    });
}

// --- 3. AUDIO ET CHANGEMENT DE COULEUR VISUEL ---
let audioCtx = null;
let oscillator = null;
const freqSlider = document.getElementById('freqSlider');
const freqValueText = document.getElementById('freqValue');

freqSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    freqValueText.innerText = val + " Hz";
    if (oscillator) {
        oscillator.frequency.setValueAtTime(val, audioCtx.currentTime);
    }
});

function playFrequency(freq, btnElement) {
    stopSound();
    freqSlider.value = freq;
    freqValueText.innerText = freq + " Hz";

    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();

    // Effet visuel cyberpunk d'alerte : tout passe au rouge/magenta plasma
    outerMat.color.setHex(0xff0055);
    innerMat.color.setHex(0xffaa00);
    coreMat.color.setHex(0xff0055);
    plasmaMat.color.setHex(0x00ffff);
    pointLight.color.setHex(0xff0055);

    statusText.innerText = `Émission active : ${freq} Hz`;
    
    document.querySelectorAll('.btn-group button').forEach(b => b.classList.remove('active-sound'));
    if(btnElement) btnElement.classList.add('active-sound');
}

function stopSound() {
    if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;

        // Retour aux couleurs bleues/vertes initiales
        outerMat.color.setHex(0x00f3ff);
        innerMat.color.setHex(0x00ff66);
        coreMat.color.setHex(0x00f3ff);
        plasmaMat.color.setHex(0xff0055);
        pointLight.color.setHex(0x00f3ff);

        statusText.innerText = "Audio arrêté";
        document.querySelectorAll('.btn-group button').forEach(b => b.classList.remove('active-sound'));
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});