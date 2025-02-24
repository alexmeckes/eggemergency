/**
 * Egg Emergency - Particle Effects System
 * Creates visual effects for egg breaks, catches, and other game events
 */

// Create particle effect for broken eggs
function createBreakParticles(x, z, eggType, scene, particlesArray) {
    // Define particle colors based on egg type
    let particleColor;
    
    switch(eggType) {
        case 'golden':
            particleColor = 0xFFD700; // Gold
            break;
        case 'bomb':
            particleColor = 0x333333; // Dark gray
            break;
        default: // normal egg
            particleColor = 0xFFFFFF; // White
            break;
    }
    
    // Create particle group
    const particleGroup = new THREE.Group();
    particleGroup.position.set(x, 0.1, z); // Slightly above ground
    
    // Number of particles
    const particleCount = eggType === 'bomb' ? 30 : 15;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        // Create particle geometry
        const particleSize = 0.1 + Math.random() * 0.2;
        const particleGeometry = new THREE.SphereGeometry(particleSize, 8, 8);
        
        // Create particle material with some variation
        const hueVariation = (Math.random() - 0.5) * 0.1;
        
        let material;
        
        if (eggType === 'bomb') {
            // Smoke-like particles for bomb
            material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0x222222).offsetHSL(0, 0, hueVariation),
                transparent: true,
                opacity: 0.7
            });
        } else {
            // Shiny particles for eggs
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(particleColor).offsetHSL(0, 0, hueVariation),
                roughness: 0.3,
                metalness: eggType === 'golden' ? 0.8 : 0.1
            });
        }
        
        const particle = new THREE.Mesh(particleGeometry, material);
        
        // Set random velocity
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 1 + Math.random() * 3;
        
        const velocityX = Math.sin(phi) * Math.cos(theta) * speed;
        const velocityY = Math.cos(phi) * speed + 2; // Add upward boost
        const velocityZ = Math.sin(phi) * Math.sin(theta) * speed;
        
        // Store velocity in userData
        particle.userData = {
            velocity: new THREE.Vector3(velocityX, velocityY, velocityZ),
            gravity: 9.8,
            lifetime: 1 + Math.random() * 0.5, // 1-1.5 seconds
            age: 0
        };
        
        // Add particle to group
        particleGroup.add(particle);
    }
    
    // Add particle group to scene
    scene.add(particleGroup);
    
    // Create explosion effect for bombs
    if (eggType === 'bomb') {
        createExplosionEffect(x, 0.5, z, scene);
    }
    
    // Add custom update function to particle group
    particleGroup.userData = {
        update: function(deltaTime) {
            let stillAlive = false;
            
            // Update each particle
            particleGroup.children.forEach((particle) => {
                // Update age
                particle.userData.age += deltaTime;
                
                // Check if particle is still alive
                if (particle.userData.age < particle.userData.lifetime) {
                    stillAlive = true;
                    
                    // Apply gravity
                    particle.userData.velocity.y -= particle.userData.gravity * deltaTime;
                    
                    // Update position
                    particle.position.x += particle.userData.velocity.x * deltaTime;
                    particle.position.y += particle.userData.velocity.y * deltaTime;
                    particle.position.z += particle.userData.velocity.z * deltaTime;
                    
                    // Bounce off ground
                    if (particle.position.y < 0) {
                        particle.position.y = -particle.position.y * 0.3; // Bounce with energy loss
                        particle.userData.velocity.y = -particle.userData.velocity.y * 0.3; // Reduce velocity
                        
                        // Apply friction to horizontal movement
                        particle.userData.velocity.x *= 0.7;
                        particle.userData.velocity.z *= 0.7;
                    }
                    
                    // Fade out particles near the end of their life
                    if (particle.material.opacity) {
                        const fadeStart = particle.userData.lifetime * 0.7;
                        if (particle.userData.age > fadeStart) {
                            const fadeAmount = 1 - ((particle.userData.age - fadeStart) / (particle.userData.lifetime - fadeStart));
                            particle.material.opacity = fadeAmount;
                        }
                    }
                } else {
                    // Make expired particles invisible
                    particle.visible = false;
                }
            });
            
            return stillAlive;
        }
    };
    
    // Add particle group to tracking array
    particlesArray.push(particleGroup);
}

// Create particle effect for catching eggs
function createCatchParticles(x, y, z, scene, particlesArray) {
    // Create particle group
    const particleGroup = new THREE.Group();
    particleGroup.position.set(x, y, z);
    
    // Number of particles
    const particleCount = 20;
    
    // Create particles in a "star burst" pattern
    for (let i = 0; i < particleCount; i++) {
        // Create particle geometry (little stars or sparkles)
        const particleGeometry = new THREE.CircleGeometry(0.1 + Math.random() * 0.1, 4);
        
        // Create particle material with color variation
        const material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xFFFFFF).offsetHSL(Math.random() * 0.3, 0.8, 0.5),
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
        
        const particle = new THREE.Mesh(particleGeometry, material);
        
        // Make particles face the camera by rotating them
        particle.rotation.x = Math.PI / 2;
        
        // Set random velocity in a spherical burst pattern
        const theta = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        
        const velocityX = Math.cos(theta) * speed;
        const velocityY = (Math.random() - 0.5) * speed;
        const velocityZ = Math.sin(theta) * speed;
        
        // Store velocity in userData
        particle.userData = {
            velocity: new THREE.Vector3(velocityX, velocityY, velocityZ),
            rotationSpeed: (Math.random() - 0.5) * 10, // Random rotation speed
            lifetime: 0.5 + Math.random() * 0.3, // 0.5-0.8 seconds
            age: 0
        };
        
        // Add particle to group
        particleGroup.add(particle);
    }
    
    // Add particle group to scene
    scene.add(particleGroup);
    
    // Add custom update function to particle group
    particleGroup.userData = {
        update: function(deltaTime) {
            let stillAlive = false;
            
            // Update each particle
            particleGroup.children.forEach((particle) => {
                // Update age
                particle.userData.age += deltaTime;
                
                // Check if particle is still alive
                if (particle.userData.age < particle.userData.lifetime) {
                    stillAlive = true;
                    
                    // Update position
                    particle.position.x += particle.userData.velocity.x * deltaTime;
                    particle.position.y += particle.userData.velocity.y * deltaTime;
                    particle.position.z += particle.userData.velocity.z * deltaTime;
                    
                    // Rotate the particle (for sparkle effect)
                    particle.rotation.z += particle.userData.rotationSpeed * deltaTime;
                    
                    // Slow down particles over time
                    particle.userData.velocity.x *= 0.95;
                    particle.userData.velocity.y *= 0.95;
                    particle.userData.velocity.z *= 0.95;
                    
                    // Fade out particles near the end of their life
                    const fadeStart = particle.userData.lifetime * 0.5;
                    if (particle.userData.age > fadeStart) {
                        const fadeAmount = 1 - ((particle.userData.age - fadeStart) / (particle.userData.lifetime - fadeStart));
                        particle.material.opacity = fadeAmount;
                    }
                } else {
                    // Make expired particles invisible
                    particle.visible = false;
                }
            });
            
            return stillAlive;
        }
    };
    
    // Add particle group to tracking array
    particlesArray.push(particleGroup);
}

// Create bomb explosion effect
function createExplosionEffect(x, y, z, scene) {
    // Create explosion light (flickering point light)
    const explosionLight = new THREE.PointLight(0xFF5500, 2, 10);
    explosionLight.position.set(x, y, z);
    scene.add(explosionLight);
    
    // Create animation for light
    const lightAnimation = {
        intensity: 2,
        distance: 10,
        time: 0,
        duration: 0.5,
        update: function(deltaTime) {
            this.time += deltaTime;
            
            if (this.time < this.duration) {
                // Flicker and fade the light
                const progress = this.time / this.duration;
                const flicker = 0.5 + 0.5 * Math.sin(progress * 30);
                
                explosionLight.intensity = this.intensity * (1 - progress) * flicker;
                explosionLight.distance = this.distance * (1 - progress * 0.5);
                
                return true;
            } else {
                // Remove the light when animation is complete
                scene.remove(explosionLight);
                return false;
            }
        }
    };
    
    // Create a ring wave effect
    const ringGeometry = new THREE.RingGeometry(0.1, 0.3, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFF5500, 
        transparent: true, 
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(x, y, z);
    ring.rotation.x = Math.PI / 2; // Lay flat
    scene.add(ring);
    
    // Create animation for ring
    const ringAnimation = {
        time: 0,
        duration: 0.8,
        update: function(deltaTime) {
            this.time += deltaTime;
            
            if (this.time < this.duration) {
                // Expand and fade ring
                const progress = this.time / this.duration;
                const scale = 1 + progress * 15; // Grow to 15x size
                
                ring.scale.set(scale, scale, scale);
                ringMaterial.opacity = 0.7 * (1 - progress);
                
                return true;
            } else {
                // Remove the ring when animation is complete
                scene.remove(ring);
                return false;
            }
        }
    };
    
    // Return animation controllers for both effects
    return [lightAnimation, ringAnimation];
} 