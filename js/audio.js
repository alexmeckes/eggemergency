/**
 * Egg Emergency - Audio System
 * Handles game sound effects and background music
 */

// Load all game sounds and music
function loadGameAudio(sounds) {
    // Create and configure audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Store audio context in sounds object
    sounds.context = audioContext;
    
    // Master volume control
    const masterGain = audioContext.createGain();
    masterGain.gain.value = 0.7; // 70% volume
    masterGain.connect(audioContext.destination);
    sounds.masterGain = masterGain;
    
    // Sound effect volume
    const sfxGain = audioContext.createGain();
    sfxGain.gain.value = 1.0;
    sfxGain.connect(masterGain);
    sounds.sfxGain = sfxGain;
    
    // Music volume
    const musicGain = audioContext.createGain();
    musicGain.gain.value = 0.5; // Music at 50% of master volume
    musicGain.connect(masterGain);
    sounds.musicGain = musicGain;
    
    // Load sound effects
    loadSoundEffect('eggSpawn', 'assets/sounds/egg_spawn.mp3', sfxGain, sounds);
    loadSoundEffect('eggCatch', 'assets/sounds/egg_catch.mp3', sfxGain, sounds);
    loadSoundEffect('eggBreak', 'assets/sounds/egg_break.mp3', sfxGain, sounds);
    loadSoundEffect('bombCatch', 'assets/sounds/bomb_catch.mp3', sfxGain, sounds);
    loadSoundEffect('gameStart', 'assets/sounds/game_start.mp3', sfxGain, sounds);
    loadSoundEffect('gameOver', 'assets/sounds/game_over.mp3', sfxGain, sounds);
    
    // Load background music
    loadMusic('bgMusic', 'assets/sounds/egg_emergency_theme.mp3', musicGain, sounds);
    
    // Since we don't have real audio files, we'll create placeholder audio
    // This allows the game to work without actual audio assets
    createPlaceholderAudio(sounds);
    
    // Add event listeners for mute/unmute
    setupAudioControls(sounds);
    
    // Start background music
    setTimeout(() => {
        if (sounds.bgMusic) {
            sounds.bgMusic.play();
        }
    }, 1000);
}

// Load an individual sound effect
function loadSoundEffect(name, url, gainNode, sounds) {
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => sounds.context.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            // Create a sound object with play method
            sounds[name] = {
                buffer: audioBuffer,
                play: function(options = {}) {
                    // Default options
                    const defaults = {
                        volume: 1.0,
                        loop: false,
                        playbackRate: 1.0
                    };
                    
                    const settings = { ...defaults, ...options };
                    
                    // Create source node
                    const source = sounds.context.createBufferSource();
                    source.buffer = audioBuffer;
                    source.loop = settings.loop;
                    source.playbackRate.value = settings.playbackRate;
                    
                    // Create gain node for this sound
                    const gainNode = sounds.context.createGain();
                    gainNode.gain.value = settings.volume;
                    
                    // Connect nodes
                    source.connect(gainNode);
                    gainNode.connect(sounds.sfxGain);
                    
                    // Start playback
                    source.start(0);
                    
                    // Return control object
                    return {
                        source: source,
                        gainNode: gainNode,
                        stop: function() {
                            source.stop();
                        }
                    };
                }
            };
        })
        .catch(error => {
            console.warn(`Failed to load sound: ${name}`, error);
        });
}

// Load background music
function loadMusic(name, url, gainNode, sounds) {
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => sounds.context.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            // Create a music object with play/pause methods
            sounds[name] = {
                buffer: audioBuffer,
                source: null,
                isPlaying: false,
                
                play: function() {
                    if (this.isPlaying) return;
                    
                    // Create source node
                    this.source = sounds.context.createBufferSource();
                    this.source.buffer = audioBuffer;
                    this.source.loop = true;
                    
                    // Connect to music gain node
                    this.source.connect(sounds.musicGain);
                    
                    // Start playback
                    this.source.start(0);
                    this.isPlaying = true;
                },
                
                pause: function() {
                    if (!this.isPlaying || !this.source) return;
                    
                    this.source.stop();
                    this.source = null;
                    this.isPlaying = false;
                },
                
                toggle: function() {
                    if (this.isPlaying) {
                        this.pause();
                    } else {
                        this.play();
                    }
                }
            };
        })
        .catch(error => {
            console.warn(`Failed to load music: ${name}`, error);
        });
}

// Create placeholder audio using oscillators since we don't have real audio files
function createPlaceholderAudio(sounds) {
    const ctx = sounds.context;
    
    // Egg spawn sound (short beep)
    sounds.eggSpawn = {
        play: function() {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = 880; // A5
            
            gain.gain.value = 0.1;
            
            osc.connect(gain);
            gain.connect(sounds.sfxGain);
            
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            
            setTimeout(() => osc.stop(), 100);
        }
    };
    
    // Egg catch sound (two-tone beep)
    sounds.eggCatch = {
        play: function() {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = 523.25; // C5
            
            gain.gain.value = 0.1;
            
            osc.connect(gain);
            gain.connect(sounds.sfxGain);
            
            osc.start();
            
            // Frequency sweep
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(659.25, ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            
            setTimeout(() => osc.stop(), 200);
        }
    };
    
    // Egg break sound (downward beep)
    sounds.eggBreak = {
        play: function() {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = 440; // A4
            
            gain.gain.value = 0.1;
            
            osc.connect(gain);
            gain.connect(sounds.sfxGain);
            
            osc.start();
            
            // Frequency sweep down
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.2);
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            
            setTimeout(() => osc.stop(), 300);
        }
    };
    
    // Bomb catch sound (explosion sound)
    sounds.bombCatch = {
        play: function() {
            const noise = ctx.createBufferSource();
            const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            // Fill buffer with noise
            for (let i = 0; i < buffer.length; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            noise.buffer = buffer;
            
            // Create lowpass filter
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 100;
            
            // Create gain node
            const gain = ctx.createGain();
            gain.gain.value = 0.1;
            
            // Connect nodes
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(sounds.sfxGain);
            
            // Start noise and ramp down gain
            noise.start();
            filter.frequency.exponentialRampToValueAtTime(1, ctx.currentTime + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        }
    };
    
    // Game start fanfare
    sounds.gameStart = {
        play: function() {
            const notes = [
                { note: 523.25, duration: 0.2 }, // C5
                { note: 659.25, duration: 0.2 }, // E5
                { note: 783.99, duration: 0.4 }  // G5
            ];
            
            let time = ctx.currentTime;
            
            notes.forEach(note => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = note.note;
                
                gain.gain.value = 0.1;
                
                osc.connect(gain);
                gain.connect(sounds.sfxGain);
                
                osc.start(time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + note.duration);
                osc.stop(time + note.duration);
                
                time += note.duration;
            });
        }
    };
    
    // Game over sound
    sounds.gameOver = {
        play: function() {
            const notes = [
                { note: 880, duration: 0.2 },   // A5
                { note: 830.6, duration: 0.2 }, // Ab5
                { note: 783.99, duration: 0.2 }, // G5
                { note: 698.46, duration: 0.2 }, // F5
                { note: 659.25, duration: 0.2 }, // E5
                { note: 587.33, duration: 0.2 }, // D5
                { note: 523.25, duration: 0.4 }  // C5
            ];
            
            let time = ctx.currentTime;
            
            notes.forEach(note => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = note.note;
                
                gain.gain.value = 0.1;
                
                osc.connect(gain);
                gain.connect(sounds.sfxGain);
                
                osc.start(time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + note.duration);
                osc.stop(time + note.duration);
                
                time += note.duration;
            });
        }
    };
    
    // Background music (simple looping pattern)
    let bgMusicSource = null;
    let isPlaying = false;
    
    sounds.bgMusic = {
        isPlaying: false,
        
        play: function() {
            if (this.isPlaying) return;
            
            // Create music pattern
            this.createMusicPattern();
            
            this.isPlaying = true;
        },
        
        pause: function() {
            if (!this.isPlaying) return;
            
            // Stop all oscillators
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            
            this.isPlaying = false;
        },
        
        toggle: function() {
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        },
        
        createMusicPattern: function() {
            // C major scale notes
            const notes = [
                261.63, // C4
                293.66, // D4
                329.63, // E4
                349.23, // F4
                392.00, // G4
                440.00, // A4
                493.88, // B4
                523.25  // C5
            ];
            
            // Simple pattern sequence of notes
            const pattern = [0, 2, 4, 5, 4, 2, 3, 1];
            let patternIndex = 0;
            
            // Play a note every 200ms
            this.intervalId = setInterval(() => {
                // Get next note
                const noteIndex = pattern[patternIndex];
                const frequency = notes[noteIndex];
                
                // Create oscillator
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = frequency;
                
                gain.gain.value = 0.05;
                
                osc.connect(gain);
                gain.connect(sounds.musicGain);
                
                // Play note
                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
                setTimeout(() => osc.stop(), 200);
                
                // Advance pattern
                patternIndex = (patternIndex + 1) % pattern.length;
            }, 200);
        }
    };
}

// Setup mute/unmute controls
function setupAudioControls(sounds) {
    // Add a sound toggle button to the UI
    const gameContainer = document.getElementById('game-container');
    
    const soundButton = document.createElement('button');
    soundButton.id = 'sound-toggle';
    soundButton.classList.add('sound-toggle');
    soundButton.innerHTML = '🔊';
    soundButton.title = 'Toggle Sound';
    
    soundButton.style.position = 'absolute';
    soundButton.style.bottom = '20px';
    soundButton.style.right = '20px';
    soundButton.style.zIndex = '100';
    soundButton.style.width = '50px';
    soundButton.style.height = '50px';
    soundButton.style.borderRadius = '50%';
    soundButton.style.fontSize = '24px';
    soundButton.style.display = 'flex';
    soundButton.style.alignItems = 'center';
    soundButton.style.justifyContent = 'center';
    soundButton.style.opacity = '0.7';
    soundButton.style.transition = 'opacity 0.2s';
    
    soundButton.addEventListener('mouseenter', () => {
        soundButton.style.opacity = '1';
    });
    
    soundButton.addEventListener('mouseleave', () => {
        soundButton.style.opacity = '0.7';
    });
    
    // Toggle mute/unmute
    let muted = false;
    soundButton.addEventListener('click', () => {
        muted = !muted;
        
        if (muted) {
            // Mute all sounds
            sounds.masterGain.gain.value = 0;
            soundButton.innerHTML = '🔇';
        } else {
            // Unmute all sounds
            sounds.masterGain.gain.value = 0.7;
            soundButton.innerHTML = '🔊';
        }
    });
    
    gameContainer.appendChild(soundButton);
} 