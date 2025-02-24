/**
 * Egg Emergency - AI Implementation
 * Controls the behavior of the three AI players
 */

// Initialize AI for the three computer players
function initializeAI(players) {
    // Set up AI properties for each player
    
    // AI 1 - Novice: Makes many mistakes, slow reaction
    if (players.ai1) {
        players.ai1.userData = {
            // AI difficulty settings
            type: 'novice',
            reactionTime: 0.8, // Seconds to react to an egg
            catchProbability: 0.6, // Probability of successfully catching an egg
            mistakeProbability: 0.3, // Probability of making a movement mistake
            targetEggIndex: -1, // Current targeted egg (-1 means no target)
            reactionTimer: 0, // Current reaction time counter
            errorOffset: 0, // Deliberate error in positioning
            moveDirection: 0, // Current move direction
            moveTimer: 0, // Timer for random movements
            baseMoveSpeed: 3, // Base speed (lower = slower)
            avoidBombProbability: 0.4, // Chance to recognize and avoid bomb eggs
            
            // AI state
            hasCaughtEgg: false, // Whether the AI currently has an egg
            transferTimer: 0, // Timer for egg transfer to basket
            
            // Movement constraints
            minX: -14, // Minimum x position (arena boundary)
            maxX: 14 // Maximum x position (arena boundary)
        };
    }
    
    // AI 2 - Intermediate: Occasionally makes mistakes, good reaction
    if (players.ai2) {
        players.ai2.userData = {
            type: 'intermediate',
            reactionTime: 0.5,
            catchProbability: 0.8,
            mistakeProbability: 0.15,
            targetEggIndex: -1,
            reactionTimer: 0,
            errorOffset: 0,
            moveDirection: 0,
            moveTimer: 0,
            baseMoveSpeed: 5,
            avoidBombProbability: 0.7,
            
            hasCaughtEgg: false,
            transferTimer: 0,
            
            minX: -14,
            maxX: 14
        };
    }
    
    // AI 3 - Expert: Rarely makes mistakes, very quick reaction
    if (players.ai3) {
        players.ai3.userData = {
            type: 'expert',
            reactionTime: 0.2,
            catchProbability: 0.95,
            mistakeProbability: 0.05,
            targetEggIndex: -1,
            reactionTimer: 0,
            errorOffset: 0,
            moveDirection: 0,
            moveTimer: 0,
            baseMoveSpeed: 7,
            avoidBombProbability: 0.9,
            prioritizeGoldenEggs: true, // Expert AI prioritizes golden eggs
            
            hasCaughtEgg: false,
            transferTimer: 0,
            
            minX: -14,
            maxX: 14
        };
    }
}

// Update AI player behavior
function updateAIPlayers(players, eggs, deltaTime, gameDifficulty) {
    // Update each AI player
    updateAIPlayer(players.ai1, eggs, deltaTime, gameDifficulty);
    updateAIPlayer(players.ai2, eggs, deltaTime, gameDifficulty);
    updateAIPlayer(players.ai3, eggs, deltaTime, gameDifficulty);
}

// Update an individual AI player
function updateAIPlayer(player, eggs, deltaTime, gameDifficulty) {
    if (!player || !player.userData) return;
    
    const ai = player.userData;
    
    // If the AI has caught an egg, handle the transfer to basket
    if (ai.hasCaughtEgg) {
        handleEggTransfer(player, deltaTime);
        return;
    }
    
    // Update random movement timer
    ai.moveTimer -= deltaTime;
    if (ai.moveTimer <= 0) {
        // Set a new random movement
        ai.moveDirection = (Math.random() - 0.5) * 2; // Random value between -1 and 1
        ai.moveTimer = Math.random() * 2; // Random timer between 0 and 2 seconds
    }
    
    // Find eggs that are targeting this player
    const targetEggs = findTargetEggs(player, eggs);
    
    // If there are no eggs targeting this player, do random movements
    if (targetEggs.length === 0) {
        doRandomMovement(player, deltaTime);
        return;
    }
    
    // If we already have a target egg, update timer and handle it
    if (ai.targetEggIndex !== -1) {
        // Update reaction timer
        ai.reactionTimer += deltaTime;
        
        // Check if the reaction time has passed
        if (ai.reactionTimer >= ai.reactionTime) {
            // Get the targeted egg
            const targetEgg = eggs[ai.targetEggIndex];
            
            // If the egg still exists, try to catch it
            if (targetEgg) {
                moveTowardEgg(player, targetEgg, deltaTime);
            } else {
                // Egg no longer exists (was caught or removed), reset target
                ai.targetEggIndex = -1;
                ai.reactionTimer = 0;
            }
        } else {
            // Still reacting, do random movement
            doRandomMovement(player, deltaTime);
        }
    } else {
        // No current target, find a new egg to target
        let bestEggIndex = -1;
        let closestDistance = Infinity;
        
        // Calculate the player's current lane (x-position range)
        const playerLane = player.position.x;
        
        // Find the closest egg or prioritize golden eggs for expert AI
        for (let i = 0; i < targetEggs.length; i++) {
            const eggIndex = targetEggs[i];
            const egg = eggs[eggIndex];
            
            // Skip bomb eggs based on avoidBombProbability
            if (egg.eggType === 'bomb' && Math.random() < ai.avoidBombProbability) {
                continue;
            }
            
            const distance = Math.abs(egg.position.x - playerLane);
            
            // For expert AI, prioritize golden eggs regardless of distance
            if (ai.prioritizeGoldenEggs && egg.eggType === 'golden') {
                bestEggIndex = eggIndex;
                break;
            }
            
            // Otherwise find the closest egg
            if (distance < closestDistance) {
                closestDistance = distance;
                bestEggIndex = eggIndex;
            }
        }
        
        // If we found an egg to target, set it
        if (bestEggIndex !== -1) {
            ai.targetEggIndex = bestEggIndex;
            ai.reactionTimer = 0;
            
            // Add some error to the target position based on skill level
            if (Math.random() < ai.mistakeProbability) {
                ai.errorOffset = (Math.random() - 0.5) * 3; // Random offset between -1.5 and 1.5
            } else {
                ai.errorOffset = 0;
            }
        } else {
            // No suitable egg found, do random movement
            doRandomMovement(player, deltaTime);
        }
    }
}

// Find eggs that are targeting a specific player
function findTargetEggs(player, eggs) {
    const targetEggs = [];
    
    for (let i = 0; i < eggs.length; i++) {
        const egg = eggs[i];
        
        // AI 1 is player.ai1, etc.
        const playerKey = player.userData.type === 'novice' ? 'ai1' : 
                        (player.userData.type === 'intermediate' ? 'ai2' : 'ai3');
        
        if (egg.targetPlayer === playerKey) {
            targetEggs.push(i);
        }
    }
    
    return targetEggs;
}

// Move the AI player toward a target egg
function moveTowardEgg(player, egg, deltaTime) {
    const ai = player.userData;
    
    // Calculate target position with error offset
    const targetX = egg.position.x + ai.errorOffset;
    
    // Calculate distance to move
    const distanceToTarget = targetX - player.position.x;
    const moveSpeed = ai.baseMoveSpeed * deltaTime;
    
    // Check if AI should attempt to catch the egg
    const eggy = egg.position.y;
    const catchWindow = egg.position.y < 4 && egg.position.y > 1;
    
    if (catchWindow && Math.abs(distanceToTarget) < 1.0 && Math.random() < ai.catchProbability) {
        // Successful catch! Mark egg as caught
        ai.hasCaughtEgg = true;
        ai.transferTimer = 1.0; // Time to transfer egg to basket
        ai.targetEggIndex = -1;
        return;
    }
    
    // Move toward the target
    if (Math.abs(distanceToTarget) > moveSpeed) {
        player.position.x += distanceToTarget > 0 ? moveSpeed : -moveSpeed;
    } else {
        player.position.x = targetX;
    }
    
    // Ensure player stays within arena boundaries
    player.position.x = Math.max(ai.minX, Math.min(ai.maxX, player.position.x));
}

// Handle random movement when AI is not targeting an egg
function doRandomMovement(player, deltaTime) {
    const ai = player.userData;
    
    // Move in the current direction
    player.position.x += ai.moveDirection * ai.baseMoveSpeed * 0.5 * deltaTime;
    
    // Ensure player stays within arena boundaries
    player.position.x = Math.max(ai.minX, Math.min(ai.maxX, player.position.x));
}

// Handle transferring a caught egg to the basket
function handleEggTransfer(player, deltaTime) {
    const ai = player.userData;
    
    // Decrease transfer timer
    ai.transferTimer -= deltaTime;
    
    // Check if transfer is complete
    if (ai.transferTimer <= 0) {
        ai.hasCaughtEgg = false;
        ai.targetEggIndex = -1;
    }
} 