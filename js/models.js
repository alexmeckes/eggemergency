/**
 * Egg Emergency - 3D Models Loader
 * Handles loading and creation of 3D models for the game
 */

// Load all game models (players, baskets, etc.)
function loadGameModels(scene, players, baskets, mixers) {
    // Since we don't have actual model files, we'll create simplified versions
    // In a real implementation, you would use THREE.GLTFLoader to load
    // detailed models from .glb or .gltf files
    
    createChanseyModel(scene, players, 'human', 0x3B82F6, mixers); // Blue Chansey (Player)
    createChanseyModel(scene, players, 'ai1', 0x10B981, mixers);   // Green Chansey (Novice AI)
    createChanseyModel(scene, players, 'ai2', 0xFFC107, mixers);   // Yellow Chansey (Intermediate AI)
    createChanseyModel(scene, players, 'ai3', 0xEF4444, mixers);   // Red Chansey (Expert AI)
    
    // Create baskets for each player
    createBasket(scene, baskets, 0, 0x3B82F6); // Player basket
    createBasket(scene, baskets, 1, 0x10B981); // AI 1 basket
    createBasket(scene, baskets, 2, 0xFFC107); // AI 2 basket
    createBasket(scene, baskets, 3, 0xEF4444); // AI 3 basket
    
    // After models are loaded, update loading bar to 100%
    updateLoadingProgress(100);
}

// Create a simplified Chansey character model
function createChanseyModel(scene, players, playerType, color, mixers) {
    // Create a group to hold all parts of the Chansey
    const chansey = new THREE.Group();
    
    // Body (egg-shaped)
    const bodyGeometry = new THREE.SphereGeometry(1, 16, 16);
    bodyGeometry.scale(1, 1.2, 0.8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.2;
    body.castShadow = true;
    chansey.add(body);
    
    // Head (smaller sphere)
    const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.5;
    head.castShadow = true;
    chansey.add(head);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 12, 12);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.1,
        metalness: 0.5
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.25, 2.6, 0.5);
    chansey.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-0.25, 2.6, 0.5);
    chansey.add(rightEye);
    
    // Pouch (half sphere)
    const pouchGeometry = new THREE.SphereGeometry(0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const pouchMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.8,
        metalness: 0.1
    });
    const pouch = new THREE.Mesh(pouchGeometry, pouchMaterial);
    pouch.position.set(0, 1, 0.75);
    pouch.rotation.x = Math.PI / 2;
    chansey.add(pouch);
    
    // Arms (small cylinders)
    const armGeometry = new THREE.CylinderGeometry(0.2, 0.15, 0.8, 12);
    const armMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(1.1, 1.5, 0);
    leftArm.rotation.z = -Math.PI / 4;
    leftArm.castShadow = true;
    chansey.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(-1.1, 1.5, 0);
    rightArm.rotation.z = Math.PI / 4;
    rightArm.castShadow = true;
    chansey.add(rightArm);
    
    // Feet (using spheres instead of capsules since CapsuleGeometry isn't available in r128)
    const footGeometry = new THREE.SphereGeometry(0.3, 16, 12);
    footGeometry.scale(1, 0.5, 1.2); // Scale to make it more oval-like
    const footMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFA9C4,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const leftFoot = new THREE.Mesh(footGeometry, footMaterial);
    leftFoot.position.set(0.5, 0.3, 0);
    leftFoot.castShadow = true;
    chansey.add(leftFoot);
    
    const rightFoot = new THREE.Mesh(footGeometry, footMaterial);
    rightFoot.position.set(-0.5, 0.3, 0);
    rightFoot.castShadow = true;
    chansey.add(rightFoot);
    
    // Ears (flattened cones)
    const earGeometry = new THREE.ConeGeometry(0.2, 0.4, 12);
    earGeometry.scale(1, 1, 0.5);
    const earMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFA9C4,
        roughness: 0.7,
        metalness: 0.1
    });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(0.4, 3, 0);
    leftEar.rotation.z = -Math.PI / 12;
    leftEar.castShadow = true;
    chansey.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(-0.4, 3, 0);
    rightEar.rotation.z = Math.PI / 12;
    rightEar.castShadow = true;
    chansey.add(rightEar);
    
    // Create idle animation by attaching an animation mixer
    const mixer = new THREE.AnimationMixer(chansey);
    
    // Add a simple idle animation (body moving up and down slightly)
    const bodyPosition = body.position.clone();
    const idleTrack = new THREE.VectorKeyframeTrack(
        '.children[0].position',
        [0, 1, 2], // Keyframe times
        [
            bodyPosition.x, bodyPosition.y, bodyPosition.z,
            bodyPosition.x, bodyPosition.y + 0.1, bodyPosition.z,
            bodyPosition.x, bodyPosition.y, bodyPosition.z
        ]
    );
    
    const idleClip = new THREE.AnimationClip('idle', 2, [idleTrack]);
    const idleAction = mixer.clipAction(idleClip);
    idleAction.play();
    
    // Add mixer to mixers array
    mixers.push(mixer);
    
    // Add the complete Chansey to the scene
    scene.add(chansey);
    
    // Store reference in players object
    players[playerType] = chansey;
    
    // Update loading progress (20% for each character)
    updateLoadingProgress((Object.keys(players).indexOf(playerType) + 1) * 15);
}

// Create a basket model
function createBasket(scene, baskets, index, color) {
    // Create a group for the basket
    const basket = new THREE.Group();
    
    // Base of the basket (cylinder)
    const baseGeometry = new THREE.CylinderGeometry(0.8, 0.6, 0.8, 16, 1, false);
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown
        roughness: 0.9,
        metalness: 0.1
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.4;
    base.receiveShadow = true;
    base.castShadow = true;
    basket.add(base);
    
    // Interior of the basket (inverted cylinder)
    const interiorGeometry = new THREE.CylinderGeometry(0.7, 0.5, 0.7, 16, 1, false);
    const interiorMaterial = new THREE.MeshStandardMaterial({
        color: 0x6B3E0B, // Darker brown
        roughness: 0.9,
        metalness: 0.1,
        side: THREE.BackSide
    });
    const interior = new THREE.Mesh(interiorGeometry, interiorMaterial);
    interior.position.y = 0.45;
    basket.add(interior);
    
    // Rim of the basket (torus)
    const rimGeometry = new THREE.TorusGeometry(0.8, 0.1, 8, 24);
    const rimMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7,
        metalness: 0.3
    });
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 0.8;
    rim.rotation.x = Math.PI / 2;
    rim.castShadow = true;
    basket.add(rim);
    
    // Add the basket to the scene
    scene.add(basket);
    
    // Add to baskets array
    baskets[index] = basket;
    
    // Update loading progress (5% for each basket)
    updateLoadingProgress(60 + (index + 1) * 5);
}

// Update loading progress
window.updateLoadingProgress = function(percent) {
    const loadingBar = document.querySelector('.loading-bar');
    if (loadingBar) {
        loadingBar.style.width = `${percent}%`;
    }
    
    // If loading is complete, show the game
    if (percent >= 100) {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        }, 500);
    }
} 