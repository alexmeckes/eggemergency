/**
 * Egg Emergency - Main Game Logic
 * A recreation of the Pokemon Stadium mini-game
 */

class EggEmergencyGame {
    constructor() {
        // Game state
        this.gameActive = false;
        this.timeRemaining = 60; // 60 seconds game time
        this.difficulty = 1; // Increases over time
        this.scores = {
            player: 0,
            ai1: 0, // Novice AI
            ai2: 0, // Intermediate AI
            ai3: 0, // Expert AI
        };
        
        // Game scene components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lights = [];
        
        // Game objects
        this.players = {
            human: null,
            ai1: null,
            ai2: null,
            ai3: null
        };
        this.eggs = [];
        this.baskets = [];
        this.particles = [];
        
        // Environment
        this.arena = null;
        this.decorations = [];
        
        // Control variables
        this.keys = {
            left: false,
            right: false,
            action: false
        };
        
        // Time tracking
        this.lastUpdateTime = 0;
        this.eggSpawnTimer = 0;
        this.timerInterval = null;
        
        // Audio
        this.sounds = {};
        
        // Animation mixers
        this.mixers = [];
        
        // Bind methods
        this.update = this.update.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Add physics properties for jumping
        this.playerVelocity = new THREE.Vector3();
        this.isJumping = false;
        this.jumpForce = 0.5;
        this.gravity = 0.02;
        this.groundLevel = 0;
        
        // Add egg storage for manual transfer
        this.playerEggs = [];
        this.maxEggs = 3; // Maximum eggs player can carry
        
        // Add transfer cooldown
        this.transferCooldown = 0;
        this.transferCooldownTime = 0.5; // Seconds between transfers
        
        // Add power-up properties
        this.powerUps = {
            speedBoost: { active: false, duration: 0 },
            eggMagnet: { active: false, duration: 0 },
            shield: { active: false, duration: 0 }
        };
        
        // Add combo system
        this.combo = 0;
        this.maxCombo = 0;
        this.comboMultiplier = 1;
        this.comboTimeout = 0;
        
        // Add double jump
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        
        // Add high score
        this.highScore = localStorage.getItem('eggEmergencyHighScore') || 0;
        
        // Add AI special abilities
        this.aiAbilities = {
            ai1: { // Novice AI
                name: 'Egg Shield',
                cooldown: 0,
                duration: 0,
                active: false
            },
            ai2: { // Intermediate AI
                name: 'Egg Magnet',
                cooldown: 0,
                duration: 0,
                active: false
            },
            ai3: { // Expert AI
                name: 'Golden Touch',
                cooldown: 0,
                duration: 0,
                active: false
            }
        };
        
        // Add achievement system
        this.achievements = {
            firstEgg: { name: 'First Egg!', description: 'Catch your first egg', earned: false },
            goldenMaster: { name: 'Golden Master', description: 'Catch 10 golden eggs', earned: false },
            comboKing: { name: 'Combo King', description: 'Achieve a 5x combo', earned: false },
            speedDemon: { name: 'Speed Demon', description: 'Use speed boost 3 times', earned: false },
            perfectGame: { name: 'Perfect Game', description: 'Win without dropping any eggs', earned: false }
        };
        
        // Load achievements from localStorage
        const savedAchievements = localStorage.getItem('eggEmergencyAchievements');
        if (savedAchievements) {
            this.achievements = JSON.parse(savedAchievements);
        }
        
        // Add difficulty scaling
        this.difficultyScaling = {
            eggSpawnRate: 1,
            eggSpeed: 1,
            powerUpSpawnRate: 1,
            aiAbilityCooldown: 1
        };
        
        // Add game statistics
        this.stats = {
            eggsCaught: 0,
            goldenEggsCaught: 0,
            eggsDropped: 0,
            powerUpsCollected: 0,
            combosAchieved: 0
        };
        
        // Initialize the game
        this.init();
    }
    
    init() {
        this.initThreeJS();
        this.initLighting();
        this.loadModels();
        this.setupArena();
        this.setupEventListeners();
        this.initAI();
        this.loadAudio();
        
        // Add key listeners for jumping and egg transfer
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && !this.isJumping) {
                this.jump();
            }
            if (event.code === 'KeyE' && this.playerEggs.length > 0) {
                this.transferEggs();
            }
        });
        
        // Start the render loop
        this.animate();
    }
    
    initThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
        this.scene.fog = new THREE.Fog(0x87CEEB, 30, 100);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 20);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('game-canvas'),
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    initLighting() {
        // Main directional light (sun)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
        mainLight.position.set(10, 30, 10);
        mainLight.castShadow = true;
        
        // Configure shadow settings
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 100;
        mainLight.shadow.camera.left = -20;
        mainLight.shadow.camera.right = 20;
        mainLight.shadow.camera.top = 20;
        mainLight.shadow.camera.bottom = -20;
        
        this.scene.add(mainLight);
        this.lights.push(mainLight);
        
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404080, 1.2);
        this.scene.add(ambientLight);
        this.lights.push(ambientLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffccaa, 0.5);
        fillLight.position.set(-10, 10, -10);
        this.scene.add(fillLight);
        this.lights.push(fillLight);
    }
    
    loadModels() {
        // This will be implemented in the models.js file
        // Here we'll call the ModelLoader.loadGameModels() function
        loadGameModels(this.scene, this.players, this.baskets, this.mixers);
    }
    
    setupArena() {
        // Create the game arena floor
        const arenaGeometry = new THREE.CircleGeometry(15, 32);
        const arenaMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x88cc88,
            roughness: 0.8,
            metalness: 0.2
        });
        this.arena = new THREE.Mesh(arenaGeometry, arenaMaterial);
        this.arena.rotation.x = -Math.PI / 2;
        this.arena.receiveShadow = true;
        this.scene.add(this.arena);
        
        // Add decorative elements around the arena
        this.addDecorations();
    }
    
    addDecorations() {
        // Add trees, flowers, clouds, etc. around the arena
        // This creates the environment and makes it visually appealing
        
        // Example: Add some trees
        const treePositions = [
            [-18, 0, -5], [18, 0, -5], 
            [-15, 0, 10], [15, 0, 10],
            [-10, 0, -15], [10, 0, -15]
        ];
        
        treePositions.forEach(pos => {
            this.addTree(pos[0], pos[1], pos[2]);
        });
        
        // Add clouds in the sky
        this.addClouds();
    }
    
    addTree(x, y, z) {
        // Simplified tree with trunk and foliage
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 3, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.1
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, y + 1.5, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        this.scene.add(trunk);
        this.decorations.push(trunk);
        
        // Foliage
        const foliageGeometry = new THREE.SphereGeometry(2, 16, 16);
        const foliageMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x228B22,
            roughness: 0.8,
            metalness: 0.1
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, y + 4, z);
        foliage.castShadow = true;
        this.scene.add(foliage);
        this.decorations.push(foliage);
    }
    
    addClouds() {
        // Add floating clouds to the sky
        const cloudPositions = [
            [-20, 30, -40], [15, 25, -30], 
            [0, 35, -50], [25, 28, -45],
            [-30, 27, -35]
        ];
        
        cloudPositions.forEach(pos => {
            this.addCloud(pos[0], pos[1], pos[2]);
        });
    }
    
    addCloud(x, y, z) {
        const cloudGroup = new THREE.Group();
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.5,
            metalness: 0.1
        });
        
        // Create multiple spheres to form a cloud shape
        const numSpheres = 5 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numSpheres; i++) {
            const size = 2 + Math.random() * 3;
            const cloudGeometry = new THREE.SphereGeometry(size, 8, 8);
            const cloudPuff = new THREE.Mesh(cloudGeometry, cloudMaterial);
            
            // Position each sphere slightly randomly to form a cloud shape
            const offsetX = (Math.random() - 0.5) * 5;
            const offsetY = (Math.random() - 0.5) * 2;
            const offsetZ = (Math.random() - 0.5) * 5;
            
            cloudPuff.position.set(offsetX, offsetY, offsetZ);
            cloudGroup.add(cloudPuff);
        }
        
        cloudGroup.position.set(x, y, z);
        this.scene.add(cloudGroup);
        this.decorations.push(cloudGroup);
        
        // Animate cloud to move slowly
        const speed = 0.01 + Math.random() * 0.02;
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        cloudGroup.userData = { 
            speed: speed * direction,
            initialX: x
        };
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        
        // Game UI event listeners
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('tutorial').addEventListener('click', () => this.showTutorial());
        document.getElementById('back-to-menu').addEventListener('click', () => this.backToMenu());
        document.getElementById('play-again').addEventListener('click', () => this.restartGame());
        
        // Show the start screen
        document.getElementById('game-start-screen').classList.add('active');
    }
    
    handleKeyDown(event) {
        if (this.gameActive) {
            switch(event.key) {
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
                case ' ':
                    this.keys.action = true;
                    break;
            }
        }
    }
    
    handleKeyUp(event) {
        if (this.gameActive) {
            switch(event.key) {
                case 'ArrowLeft':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                    this.keys.right = false;
                    break;
                case ' ':
                    this.keys.action = false;
                    break;
            }
        }
    }
    
    initAI() {
        // Initialize AI for the three computer players
        // This will be implemented in the ai.js file
        initializeAI(this.players);
    }
    
    loadAudio() {
        // Load all game sounds
        // This will be implemented in the audio.js file
        loadGameAudio(this.sounds);
    }
    
    startGame() {
        // Hide start screen
        document.getElementById('game-start-screen').classList.remove('active');
        
        // Reset game state
        this.scores = { player: 0, ai1: 0, ai2: 0, ai3: 0 };
        this.timeRemaining = 60;
        this.difficulty = 1;
        this.updateScoreDisplay();
        
        // Play start sound
        if (this.sounds.gameStart) {
            this.sounds.gameStart.play();
        }
        
        // Start timer
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            document.getElementById('timer').textContent = this.timeRemaining;
            
            // Increase difficulty every 15 seconds
            if (this.timeRemaining % 15 === 0 && this.timeRemaining > 0) {
                this.difficulty += 0.5;
            }
            
            // End game when time is up
            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 1000);
        
        // Position players and baskets
        this.positionPlayers();
        
        // Set game as active
        this.gameActive = true;
        
        // Reset last update time
        this.lastUpdateTime = performance.now();
    }
    
    positionPlayers() {
        // Position the four Chansey players around the arena
        const positions = [
            { x: -6, z: 0, rotation: Math.PI / 2 },   // Left (Human player)
            { x: 0, z: 6, rotation: 0 },              // Top (AI 1 - Novice)
            { x: 6, z: 0, rotation: -Math.PI / 2 },   // Right (AI 2 - Intermediate)
            { x: 0, z: -6, rotation: Math.PI }        // Bottom (AI 3 - Expert)
        ];
        
        // Position human player
        if (this.players.human) {
            this.players.human.position.set(positions[0].x, 0, positions[0].z);
            this.players.human.rotation.y = positions[0].rotation;
        }
        
        // Position AI players
        if (this.players.ai1) {
            this.players.ai1.position.set(positions[1].x, 0, positions[1].z);
            this.players.ai1.rotation.y = positions[1].rotation;
        }
        
        if (this.players.ai2) {
            this.players.ai2.position.set(positions[2].x, 0, positions[2].z);
            this.players.ai2.rotation.y = positions[2].rotation;
        }
        
        if (this.players.ai3) {
            this.players.ai3.position.set(positions[3].x, 0, positions[3].z);
            this.players.ai3.rotation.y = positions[3].rotation;
        }
        
        // Position baskets correspondingly
        for (let i = 0; i < this.baskets.length; i++) {
            if (this.baskets[i]) {
                // Position baskets behind each player
                const basketOffsetX = Math.sin(positions[i].rotation) * 2;
                const basketOffsetZ = Math.cos(positions[i].rotation) * 2;
                
                this.baskets[i].position.set(
                    positions[i].x - basketOffsetX,
                    0,
                    positions[i].z - basketOffsetZ
                );
                
                this.baskets[i].rotation.y = positions[i].rotation;
            }
        }
    }
    
    showTutorial() {
        document.getElementById('game-start-screen').classList.remove('active');
        document.getElementById('tutorial-screen').classList.add('active');
    }
    
    backToMenu() {
        document.getElementById('tutorial-screen').classList.remove('active');
        document.getElementById('game-start-screen').classList.add('active');
    }
    
    spawnEgg() {
        // Create a new egg and add it to the scene
        const eggType = Math.random() < 0.85 ? 'normal' : 
                       (Math.random() < 0.9 ? 'golden' : 'bomb');
        
        const egg = createEgg(eggType, this.scene);
        
        // Determine which player the egg should target
        const targetPlayerIndex = Math.floor(Math.random() * 4);
        let targetPosition;
        
        switch(targetPlayerIndex) {
            case 0: // Human player
                targetPosition = this.players.human.position.clone();
                egg.targetPlayer = 'human';
                break;
            case 1: // AI 1 (Novice)
                targetPosition = this.players.ai1.position.clone();
                egg.targetPlayer = 'ai1';
                break;
            case 2: // AI 2 (Intermediate)
                targetPosition = this.players.ai2.position.clone();
                egg.targetPlayer = 'ai2';
                break;
            case 3: // AI 3 (Expert)
                targetPosition = this.players.ai3.position.clone();
                egg.targetPlayer = 'ai3';
                break;
        }
        
        // Position egg above the target player
        egg.position.set(
            targetPosition.x, 
            20, // Start high in the air
            targetPosition.z
        );
        
        // Add the egg to our array to track it
        this.eggs.push(egg);
        
        // Play spawn sound
        if (this.sounds.eggSpawn) {
            this.sounds.eggSpawn.play();
        }
    }
    
    updateEggs(deltaTime) {
        // Update each egg's position and check for collisions
        for (let i = this.eggs.length - 1; i >= 0; i--) {
            const egg = this.eggs[i];
            
            // Move the egg downward
            egg.position.y -= (5 + this.difficulty) * deltaTime;
            
            // Rotate the egg as it falls for visual effect
            egg.rotation.x += 1.5 * deltaTime;
            egg.rotation.z += 1.0 * deltaTime;
            
            // Check if egg has hit the ground
            if (egg.position.y <= 0) {
                // Egg has hit the ground - create break effect
                this.createEggBreakEffect(egg.position.x, egg.position.z, egg.eggType);
                
                // Play break sound
                if (this.sounds.eggBreak) {
                    this.sounds.eggBreak.play();
                }
                
                // Remove the egg from the scene and array
                this.scene.remove(egg);
                this.eggs.splice(i, 1);
                
                // Deduct points for dropped egg if it wasn't a bomb
                if (egg.eggType !== 'bomb') {
                    if (egg.targetPlayer === 'human') {
                        this.scores.player = Math.max(0, this.scores.player - 1);
                    } else if (egg.targetPlayer === 'ai1') {
                        this.scores.ai1 = Math.max(0, this.scores.ai1 - 1);
                    } else if (egg.targetPlayer === 'ai2') {
                        this.scores.ai2 = Math.max(0, this.scores.ai2 - 1);
                    } else if (egg.targetPlayer === 'ai3') {
                        this.scores.ai3 = Math.max(0, this.scores.ai3 - 1);
                    }
                    
                    // Update score display
                    this.updateScoreDisplay();
                }
                
                continue;
            }
            
            // Check for collision with players
            this.checkEggPlayerCollision(egg, i);
        }
    }
    
    checkEggPlayerCollision(egg, eggIndex) {
        // Get the target player for this egg
        let targetPlayer;
        switch(egg.targetPlayer) {
            case 'human':
                targetPlayer = this.players.human;
                break;
            case 'ai1':
                targetPlayer = this.players.ai1;
                break;
            case 'ai2':
                targetPlayer = this.players.ai2;
                break;
            case 'ai3':
                targetPlayer = this.players.ai3;
                break;
        }
        
        if (!targetPlayer) return;
        
        // Simple collision detection - check if egg is close enough to player
        const catchDistance = 1.5; // Adjust as needed for gameplay
        const distance = egg.position.distanceTo(targetPlayer.position);
        
        if (distance < catchDistance && egg.position.y < 4 && egg.position.y > 1) {
            // Egg is caught by player
            this.catchEgg(egg, egg.targetPlayer);
            
            // Remove the egg from the scene and array
            this.scene.remove(egg);
            this.eggs.splice(eggIndex, 1);
        }
    }
    
    catchEgg(egg, playerType) {
        // Handle the egg being caught by a player
        
        // Play catch sound
        if (this.sounds.eggCatch) {
            this.sounds.eggCatch.play();
        }
        
        // Create catch particle effect
        this.createCatchEffect(egg.position.x, egg.position.y, egg.position.z);
        
        // Award points based on egg type
        if (egg.eggType === 'bomb') {
            // Bomb egg - deduct points
            if (playerType === 'human') {
                this.scores.player = Math.max(0, this.scores.player - 2);
            } else if (playerType === 'ai1') {
                this.scores.ai1 = Math.max(0, this.scores.ai1 - 2);
            } else if (playerType === 'ai2') {
                this.scores.ai2 = Math.max(0, this.scores.ai2 - 2);
            } else if (playerType === 'ai3') {
                this.scores.ai3 = Math.max(0, this.scores.ai3 - 2);
            }
            
            // Play bomb sound
            if (this.sounds.bombCatch) {
                this.sounds.bombCatch.play();
            }
        } else {
            // Normal or golden egg - add points
            const points = egg.eggType === 'golden' ? 3 : 1;
            
            if (playerType === 'human') {
                this.scores.player += points;
            } else if (playerType === 'ai1') {
                this.scores.ai1 += points;
            } else if (playerType === 'ai2') {
                this.scores.ai2 += points;
            } else if (playerType === 'ai3') {
                this.scores.ai3 += points;
            }
        }
        
        // Update score display
        this.updateScoreDisplay();
    }
    
    createEggBreakEffect(x, z, eggType) {
        // Create particle effect for broken egg
        createBreakParticles(x, z, eggType, this.scene, this.particles);
    }
    
    createCatchEffect(x, y, z) {
        // Create particle effect for egg catch
        createCatchParticles(x, y, z, this.scene, this.particles);
    }
    
    updateScoreDisplay() {
        // Update UI with current scores
        document.querySelector('#player-score .score-value').textContent = this.scores.player;
        document.querySelector('#ai1-score .score-value').textContent = this.scores.ai1;
        document.querySelector('#ai2-score .score-value').textContent = this.scores.ai2;
        document.querySelector('#ai3-score .score-value').textContent = this.scores.ai3;
    }
    
    updateParticles(deltaTime) {
        // Update all particle systems
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (particle.userData.update) {
                // Call the custom update function
                const alive = particle.userData.update(deltaTime);
                
                // If particle is dead, remove it
                if (!alive) {
                    this.scene.remove(particle);
                    this.particles.splice(i, 1);
                }
            }
        }
    }
    
    updateClouds(deltaTime) {
        // Animate clouds
        this.decorations.forEach(decoration => {
            if (decoration.userData && decoration.userData.speed) {
                // Move cloud
                decoration.position.x += decoration.userData.speed;
                
                // Wrap around if cloud goes too far
                const maxOffset = 50;
                if (decoration.position.x > decoration.userData.initialX + maxOffset) {
                    decoration.position.x = decoration.userData.initialX - maxOffset;
                } else if (decoration.position.x < decoration.userData.initialX - maxOffset) {
                    decoration.position.x = decoration.userData.initialX + maxOffset;
                }
            }
        });
    }
    
    updatePlayerAnimations(deltaTime) {
        // Update animation mixers
        this.mixers.forEach(mixer => {
            mixer.update(deltaTime);
        });
    }
    
    updateHumanPlayer(deltaTime) {
        if (!this.players.human) return;
        
        // Handle player movement based on keyboard input
        const moveSpeed = 8 * deltaTime;
        
        if (this.keys.left) {
            // Move left
            this.players.human.position.x -= moveSpeed;
            // Limit to arena boundaries
            this.players.human.position.x = Math.max(-14, this.players.human.position.x);
        }
        
        if (this.keys.right) {
            // Move right
            this.players.human.position.x += moveSpeed;
            // Limit to arena boundaries
            this.players.human.position.x = Math.min(14, this.players.human.position.x);
        }
    }
    
    updateAI(deltaTime) {
        // Update AI player behavior
        // This will be handled in the ai.js file
        updateAIPlayers(this.players, this.eggs, deltaTime, this.difficulty);
    }
    
    endGame() {
        // Stop the game
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        // Play game over sound
        if (this.sounds.gameOver) {
            this.sounds.gameOver.play();
        }
        
        // Prepare final score display
        const finalScores = document.getElementById('final-scores');
        finalScores.innerHTML = `
            <div class="final-player-score">
                <div class="player-label">You:</div>
                <div class="player-points">${this.scores.player}</div>
            </div>
            <div class="final-player-score">
                <div class="player-label">Novice AI:</div>
                <div class="player-points">${this.scores.ai1}</div>
            </div>
            <div class="final-player-score">
                <div class="player-label">Intermediate AI:</div>
                <div class="player-points">${this.scores.ai2}</div>
            </div>
            <div class="final-player-score">
                <div class="player-label">Expert AI:</div>
                <div class="player-points">${this.scores.ai3}</div>
            </div>
        `;
        
        // Determine the winner
        const scores = [
            { player: 'You', score: this.scores.player },
            { player: 'Novice AI', score: this.scores.ai1 },
            { player: 'Intermediate AI', score: this.scores.ai2 },
            { player: 'Expert AI', score: this.scores.ai3 }
        ];
        
        scores.sort((a, b) => b.score - a.score);
        
        const winnerDisplay = document.createElement('div');
        winnerDisplay.className = 'winner-display';
        winnerDisplay.innerHTML = `<h3>Winner: ${scores[0].player} with ${scores[0].score} points!</h3>`;
        finalScores.appendChild(winnerDisplay);
        
        // Show game over screen
        document.getElementById('game-over-screen').classList.add('active');
    }
    
    restartGame() {
        // Hide game over screen
        document.getElementById('game-over-screen').classList.remove('active');
        
        // Clean up existing eggs
        for (const egg of this.eggs) {
            this.scene.remove(egg);
        }
        this.eggs = [];
        
        // Clean up existing particles
        for (const particle of this.particles) {
            this.scene.remove(particle);
        }
        this.particles = [];
        
        // Start a new game
        this.startGame();
    }
    
    update(currentTime) {
        if (!this.lastUpdateTime) {
            this.lastUpdateTime = currentTime;
            return;
        }
        
        // Calculate delta time in seconds
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;
        
        // Only update gameplay elements if game is active
        if (this.gameActive) {
            // Spawn eggs based on difficulty
            this.eggSpawnTimer += deltaTime;
            const spawnInterval = Math.max(0.5, 2 - (this.difficulty * 0.2));
            
            if (this.eggSpawnTimer >= spawnInterval) {
                this.eggSpawnTimer = 0;
                this.spawnEgg();
            }
            
            // Update all game objects
            this.updateEggs(deltaTime);
            this.updateHumanPlayer(deltaTime);
            this.updateAI(deltaTime);
        }
        
        // Always update these elements, even when game is paused
        this.updateParticles(deltaTime);
        this.updateClouds(deltaTime);
        this.updatePlayerAnimations(deltaTime);
        
        // Update player physics
        if (this.isJumping) {
            this.playerVelocity.y -= this.gravity;
            this.players.human.position.y += this.playerVelocity.y;
            
            // Check for ground collision
            if (this.players.human.position.y <= this.groundLevel) {
                this.players.human.position.y = this.groundLevel;
                this.playerVelocity.y = 0;
                this.isJumping = false;
            }
        }
        
        // Update transfer cooldown
        if (this.transferCooldown > 0) {
            this.transferCooldown -= deltaTime;
        }
        
        // Update egg catching logic
        this.eggs.forEach((egg, index) => {
            if (this.checkCollision(this.players.human, egg) && this.playerEggs.length < this.maxEggs) {
                // Catch egg
                this.playerEggs.push({
                    type: egg.eggType,
                    mesh: egg
                });
                
                // Remove egg from scene
                this.scene.remove(egg);
                this.eggs.splice(index, 1);
                
                // Play catch sound
                if (this.sounds.eggCatch) {
                    this.sounds.eggCatch.play();
                }
                
                // Create particle effect
                this.createCatchEffect(egg.position);
            }
        });
        
        // Update egg storage display
        this.updateEggStorageDisplay();
        
        // Update power-ups
        this.updatePowerUps(deltaTime);
        
        // Update combo
        this.updateCombo(deltaTime);
        
        // Spawn power-ups
        if (Math.random() < 0.01) { // 1% chance per frame
            this.spawnPowerUp();
        }
        
        // Check for power-up collection
        Object.values(this.powerUps).forEach(powerUp => {
            if (powerUp.mesh) {
                const distance = this.players.human.position.distanceTo(powerUp.mesh.position);
                if (distance < 1) {
                    this.collectPowerUp(powerUp.mesh);
                }
            }
        });
        
        // Apply power-up effects
        if (this.powerUps.speedBoost.active) {
            this.moveSpeed *= 1.5;
        }
        
        if (this.powerUps.eggMagnet.active) {
            this.eggs.forEach(egg => {
                const direction = new THREE.Vector3()
                    .subVectors(this.players.human.position, egg.position)
                    .normalize();
                egg.position.add(direction.multiplyScalar(0.1));
            });
        }
        
        // Update difficulty
        this.updateDifficulty();
        
        // Update AI abilities
        this.updateAIAbilities(deltaTime);
        
        // Check achievements
        this.checkAchievements();
        
        // Update stats display
        this.updateStatsDisplay();
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Get current time for update
        const currentTime = performance.now();
        
        // Update game state
        this.update(currentTime);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.playerVelocity.y = this.jumpForce;
            this.canDoubleJump = true;
            this.hasDoubleJumped = false;
            
            // Create jump particles
            this.createJumpEffect();
        } else if (this.canDoubleJump && !this.hasDoubleJumped) {
            this.playerVelocity.y = this.jumpForce * 0.8;
            this.hasDoubleJumped = true;
            this.canDoubleJump = false;
            
            // Create double jump particles
            this.createJumpEffect(true);
        }
    }
    
    createJumpEffect(isDoubleJump = false) {
        const particleCount = isDoubleJump ? 8 : 12;
        const color = isDoubleJump ? 0x00FFFF : 0xFFFFFF;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshStandardMaterial({ color: color })
            );
            
            particle.position.copy(this.players.human.position);
            particle.position.y += 0.5;
            
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 0.2;
            const lifetime = 0.5 + Math.random() * 0.5;
            
            particle.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    Math.random() * speed,
                    Math.sin(angle) * speed
                ),
                lifetime: lifetime,
                update: (deltaTime) => {
                    particle.position.add(particle.userData.velocity);
                    particle.userData.lifetime -= deltaTime;
                    return particle.userData.lifetime > 0;
                }
            };
            
            this.scene.add(particle);
            this.particles.push(particle);
        }
    }
    
    spawnPowerUp() {
        if (Math.random() < 0.1) { // 10% chance to spawn power-up
            const powerUpTypes = ['speedBoost', 'eggMagnet', 'shield'];
            const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
            
            const powerUp = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.5, 0),
                new THREE.MeshStandardMaterial({
                    color: this.getPowerUpColor(type),
                    emissive: this.getPowerUpColor(type),
                    emissiveIntensity: 0.5
                })
            );
            
            // Position power-up above the arena
            powerUp.position.set(
                (Math.random() - 0.5) * 20,
                15,
                (Math.random() - 0.5) * 20
            );
            
            powerUp.userData = { type: type };
            this.scene.add(powerUp);
            this.powerUps[type].mesh = powerUp;
        }
    }
    
    getPowerUpColor(type) {
        switch(type) {
            case 'speedBoost': return 0xFF0000;
            case 'eggMagnet': return 0x00FF00;
            case 'shield': return 0x0000FF;
            default: return 0xFFFFFF;
        }
    }
    
    collectPowerUp(powerUp) {
        const type = powerUp.userData.type;
        this.powerUps[type].active = true;
        this.powerUps[type].duration = 10; // 10 seconds duration
        
        // Play power-up sound
        if (this.sounds.powerUp) {
            this.sounds.powerUp.play();
        }
        
        // Create collection effect
        this.createPowerUpEffect(powerUp.position, type);
        
        // Remove power-up from scene
        this.scene.remove(powerUp);
        this.powerUps[type].mesh = null;
    }
    
    createPowerUpEffect(position, type) {
        const particleCount = 20;
        const color = this.getPowerUpColor(type);
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 8, 8),
                new THREE.MeshStandardMaterial({ color: color })
            );
            
            particle.position.copy(position);
            
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 0.3;
            const lifetime = 1 + Math.random() * 0.5;
            
            particle.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    Math.random() * speed,
                    Math.sin(angle) * speed
                ),
                lifetime: lifetime,
                update: (deltaTime) => {
                    particle.position.add(particle.userData.velocity);
                    particle.userData.lifetime -= deltaTime;
                    return particle.userData.lifetime > 0;
                }
            };
            
            this.scene.add(particle);
            this.particles.push(particle);
        }
    }
    
    updatePowerUps(deltaTime) {
        Object.keys(this.powerUps).forEach(type => {
            if (this.powerUps[type].active) {
                this.powerUps[type].duration -= deltaTime;
                
                if (this.powerUps[type].duration <= 0) {
                    this.powerUps[type].active = false;
                    // Play power-down sound
                    if (this.sounds.powerDown) {
                        this.sounds.powerDown.play();
                    }
                }
            }
        });
    }
    
    updateCombo(deltaTime) {
        if (this.comboTimeout > 0) {
            this.comboTimeout -= deltaTime;
            if (this.comboTimeout <= 0) {
                this.combo = 0;
                this.comboMultiplier = 1;
            }
        }
    }
    
    transferEggs() {
        if (this.transferCooldown > 0) return;
        
        // Transfer all eggs to basket
        let points = 0;
        this.playerEggs.forEach(egg => {
            if (egg.type === 'golden') points += 3;
            else if (egg.type === 'bomb') points -= 2;
            else points += 1;
        });
        
        // Apply combo multiplier
        points *= this.comboMultiplier;
        
        // Update score
        this.scores.player += points;
        this.updateScore('human');
        
        // Update combo
        this.combo++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.comboMultiplier = 1 + (this.combo - 1) * 0.2; // 20% increase per combo
        this.comboTimeout = 3; // Reset combo after 3 seconds
        
        // Update high score
        if (this.scores.player > this.highScore) {
            this.highScore = this.scores.player;
            localStorage.setItem('eggEmergencyHighScore', this.highScore);
        }
        
        // Clear eggs and start cooldown
        this.playerEggs = [];
        this.transferCooldown = this.transferCooldownTime;
        
        // Play transfer sound
        if (this.sounds.eggCatch) {
            this.sounds.eggCatch.play();
        }
        
        // Create combo effect
        this.createComboEffect();
    }
    
    createComboEffect() {
        const comboText = document.createElement('div');
        comboText.className = 'combo-text';
        comboText.textContent = `${this.combo}x COMBO!`;
        document.getElementById('ui-container').appendChild(comboText);
        
        // Animate and remove
        setTimeout(() => {
            comboText.remove();
        }, 1000);
    }
    
    updateEggStorageDisplay() {
        // Create or update the egg storage display
        let storageDisplay = document.getElementById('egg-storage');
        if (!storageDisplay) {
            storageDisplay = document.createElement('div');
            storageDisplay.id = 'egg-storage';
            document.getElementById('ui-container').appendChild(storageDisplay);
        }
        
        // Update display content
        storageDisplay.innerHTML = `
            <div class="egg-storage-title">Egg Storage (${this.playerEggs.length}/${this.maxEggs})</div>
            <div class="egg-storage-content">
                ${this.playerEggs.map(egg => `
                    <div class="egg-icon ${egg.type}"></div>
                `).join('')}
            </div>
            <div class="egg-storage-hint">Press E to transfer eggs</div>
        `;
    }
    
    updateDifficulty() {
        // Scale difficulty based on time and score
        const timeFactor = 1 + (60 - this.timeRemaining) / 60;
        const scoreFactor = 1 + this.scores.player / 100;
        
        this.difficultyScaling = {
            eggSpawnRate: timeFactor * 1.2,
            eggSpeed: timeFactor * 1.1,
            powerUpSpawnRate: timeFactor * 0.8,
            aiAbilityCooldown: Math.max(0.5, 1 - (scoreFactor - 1) * 0.2)
        };
    }
    
    updateAIAbilities(deltaTime) {
        Object.keys(this.aiAbilities).forEach(aiKey => {
            const ability = this.aiAbilities[aiKey];
            if (ability.cooldown > 0) {
                ability.cooldown -= deltaTime;
            }
            if (ability.duration > 0) {
                ability.duration -= deltaTime;
                if (ability.duration <= 0) {
                    ability.active = false;
                }
            }
        });
    }
    
    activateAIAbility(aiKey) {
        const ability = this.aiAbilities[aiKey];
        if (ability.cooldown > 0) return;
        
        switch(aiKey) {
            case 'ai1': // Novice AI - Egg Shield
                ability.active = true;
                ability.duration = 5;
                ability.cooldown = 15;
                this.createAIShieldEffect(this.players.ai1);
                break;
                
            case 'ai2': // Intermediate AI - Egg Magnet
                ability.active = true;
                ability.duration = 8;
                ability.cooldown = 20;
                this.createAIMagnetEffect(this.players.ai2);
                break;
                
            case 'ai3': // Expert AI - Golden Touch
                ability.active = true;
                ability.duration = 10;
                ability.cooldown = 25;
                this.createAIGoldenEffect(this.players.ai3);
                break;
        }
    }
    
    createAIShieldEffect(player) {
        const shield = new THREE.Mesh(
            new THREE.SphereGeometry(2, 16, 16),
            new THREE.MeshStandardMaterial({
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.3,
                emissive: 0x00FFFF,
                emissiveIntensity: 0.5
            })
        );
        shield.position.copy(player.position);
        this.scene.add(shield);
        
        // Animate shield
        const duration = 5;
        const startTime = performance.now();
        
        shield.userData = {
            update: (deltaTime) => {
                const elapsed = (performance.now() - startTime) / 1000;
                if (elapsed >= duration) {
                    this.scene.remove(shield);
                    return false;
                }
                
                shield.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.1);
                shield.material.opacity = 0.3 + Math.sin(elapsed * 2) * 0.1;
                return true;
            }
        };
        
        this.particles.push(shield);
    }
    
    createAIMagnetEffect(player) {
        const magnet = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.2, 16, 32),
            new THREE.MeshStandardMaterial({
                color: 0x00FF00,
                emissive: 0x00FF00,
                emissiveIntensity: 0.5
            })
        );
        magnet.position.copy(player.position);
        magnet.rotation.x = Math.PI / 2;
        this.scene.add(magnet);
        
        // Animate magnet
        const duration = 8;
        const startTime = performance.now();
        
        magnet.userData = {
            update: (deltaTime) => {
                const elapsed = (performance.now() - startTime) / 1000;
                if (elapsed >= duration) {
                    this.scene.remove(magnet);
                    return false;
                }
                
                magnet.rotation.z += deltaTime * 2;
                return true;
            }
        };
        
        this.particles.push(magnet);
    }
    
    createAIGoldenEffect(player) {
        const golden = new THREE.Mesh(
            new THREE.OctahedronGeometry(1.5, 0),
            new THREE.MeshStandardMaterial({
                color: 0xFFD700,
                emissive: 0xFFD700,
                emissiveIntensity: 0.5
            })
        );
        golden.position.copy(player.position);
        this.scene.add(golden);
        
        // Animate golden effect
        const duration = 10;
        const startTime = performance.now();
        
        golden.userData = {
            update: (deltaTime) => {
                const elapsed = (performance.now() - startTime) / 1000;
                if (elapsed >= duration) {
                    this.scene.remove(golden);
                    return false;
                }
                
                golden.rotation.x += deltaTime;
                golden.rotation.y += deltaTime;
                return true;
            }
        };
        
        this.particles.push(golden);
    }
    
    checkAchievements() {
        // First Egg
        if (this.stats.eggsCaught === 1) {
            this.unlockAchievement('firstEgg');
        }
        
        // Golden Master
        if (this.stats.goldenEggsCaught >= 10) {
            this.unlockAchievement('goldenMaster');
        }
        
        // Combo King
        if (this.maxCombo >= 5) {
            this.unlockAchievement('comboKing');
        }
        
        // Speed Demon
        if (this.stats.powerUpsCollected >= 3) {
            this.unlockAchievement('speedDemon');
        }
        
        // Perfect Game
        if (this.stats.eggsDropped === 0 && this.timeRemaining <= 0) {
            this.unlockAchievement('perfectGame');
        }
    }
    
    unlockAchievement(achievementKey) {
        if (this.achievements[achievementKey].earned) return;
        
        this.achievements[achievementKey].earned = true;
        localStorage.setItem('eggEmergencyAchievements', JSON.stringify(this.achievements));
        
        // Show achievement notification
        this.showAchievementNotification(achievementKey);
    }
    
    showAchievementNotification(achievementKey) {
        const achievement = this.achievements[achievementKey];
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
        
        document.getElementById('ui-container').appendChild(notification);
        
        // Animate and remove
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    updateStatsDisplay() {
        const statsDisplay = document.getElementById('stats-display');
        if (!statsDisplay) return;
        
        statsDisplay.innerHTML = `
            <div class="stats-item">Eggs Caught: ${this.stats.eggsCaught}</div>
            <div class="stats-item">Golden Eggs: ${this.stats.goldenEggsCaught}</div>
            <div class="stats-item">Max Combo: ${this.maxCombo}x</div>
            <div class="stats-item">Power-ups: ${this.stats.powerUpsCollected}</div>
        `;
    }
}

// Helper function to create an egg object
function createEgg(type, scene) {
    let color, size;
    
    switch(type) {
        case 'golden':
            color = 0xFFD700; // Gold
            size = 0.8;
            break;
        case 'bomb':
            color = 0x222222; // Dark gray/black
            size = 0.9;
            break;
        default: // normal egg
            color = 0xFFFFFF; // White
            size = 0.8;
            break;
    }
    
    // Create egg geometry
    const eggGeometry = new THREE.SphereGeometry(size, 16, 16);
    // Stretch the sphere slightly to make it more egg-shaped
    eggGeometry.scale(1, 1.3, 1);
    
    const eggMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: type === 'golden' ? 0.8 : 0.1
    });
    
    const egg = new THREE.Mesh(eggGeometry, eggMaterial);
    egg.castShadow = true;
    
    // Store egg type
    egg.eggType = type;
    
    // Add egg to scene
    scene.add(egg);
    
    return egg;
} 