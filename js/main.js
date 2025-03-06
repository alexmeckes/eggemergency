/**
 * Egg Emergency - Main Entry Point
 * Initializes the game and handles the main game loop
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Egg Emergency - Game Initializing');
    
    // Initialize tutorial images with placeholders
    initializePlaceholderImages();
    
    // Create game logo
    createGameLogo();
    
    // Create and initialize the game
    const game = new EggEmergencyGame();
    
    // Expose game to window for debugging
    window.game = game;
    
    // Initialize creator info button functionality
    setupCreatorInfoButton();
});

// Initialize placeholder images for tutorial
function initializePlaceholderImages() {
    // Since we don't have actual image assets, create colored rectangles as placeholders
    const tutorialImages = document.querySelectorAll('.tutorial-step img');
    
    // Canvas to generate placeholder images
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    // Generate placeholder images with different colors for each tutorial step
    const placeholderColors = ['#3B82F6', '#10B981', '#FFCB05'];
    
    tutorialImages.forEach((img, index) => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Fill with color
        ctx.fillStyle = placeholderColors[index % placeholderColors.length];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some visual elements based on the tutorial step
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        
        switch(index) {
            case 0: // Move and Jump
                // Draw a character
                ctx.beginPath();
                ctx.arc(100, 100, 30, 0, Math.PI * 2); // Body
                ctx.fill();
                
                // Draw arrow keys and space bar
                ctx.fillStyle = 'black';
                ctx.fillText('← →', 90, 75);
                ctx.fillText('SPACE', 80, 120);
                break;
                
            case 1: // Catch and Transfer Eggs
                // Draw an egg
                ctx.beginPath();
                ctx.ellipse(80, 80, 20, 25, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw a basket
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(120, 90, 40, 30);
                
                // Draw an arrow
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(100, 80);
                ctx.lineTo(120, 80);
                ctx.lineTo(115, 75);
                ctx.moveTo(120, 80);
                ctx.lineTo(115, 85);
                ctx.stroke();
                
                // Draw E key
                ctx.fillStyle = 'black';
                ctx.fillText('E', 100, 120);
                break;
                
            case 2: // Special Eggs
                // Draw a normal egg
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.ellipse(60, 80, 15, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Draw a golden egg
                ctx.fillStyle = 'gold';
                ctx.beginPath();
                ctx.ellipse(100, 80, 15, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // Draw a bomb egg
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.ellipse(140, 80, 15, 20, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Labels
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.fillText('+1', 58, 110);
                ctx.fillText('+3', 98, 110);
                ctx.fillText('-2', 138, 110);
                break;
        }
        
        // Set the image src to the canvas data
        img.src = canvas.toDataURL('image/png');
    });
}

// Create a simple logo for the loading screen
function createGameLogo() {
    const logoImg = document.querySelector('.logo');
    if (logoImg) {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw title
        ctx.fillStyle = '#FFCB05'; // Yellow
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('EGG EMERGENCY', canvas.width / 2, 60);
        
        // Draw a simple egg graphic
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, 115, 25, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add a shadow effect
        ctx.shadowColor = '#FFCB05';
        ctx.shadowBlur = 15;
        ctx.strokeStyle = '#FFCB05';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Set the image src to the canvas data
        logoImg.src = canvas.toDataURL('image/png');
    }
}

// Setup creator info button and modal
function setupCreatorInfoButton() {
    const infoButton = document.getElementById('creator-info-button');
    const infoModal = document.getElementById('creator-info-modal');
    const closeButton = document.querySelector('.close-button');
    
    // Show modal when info button is clicked
    infoButton.addEventListener('click', () => {
        infoModal.style.display = 'flex';
    });
    
    // Hide modal when close button is clicked
    closeButton.addEventListener('click', () => {
        infoModal.style.display = 'none';
    });
    
    // Hide modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === infoModal) {
            infoModal.style.display = 'none';
        }
    });
} 