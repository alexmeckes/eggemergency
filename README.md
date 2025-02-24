# Egg Emergency

A fun, challenging egg-catching game featuring 3 AI players at varying skill levels competing against a human player.

![Game Screenshot](screenshot.png)

## About the Game

Egg Emergency is a game where players control characters who must catch falling eggs in their pouches, safely transfer them to baskets, and avoid dropping them. The player who collects the most points within the 60-second time limit wins!

## Features

- **Beautiful 3D Graphics** - Vibrant, colorful environment with toon-shaded graphics and dynamic lighting
- **Three AI Difficulty Levels**:
  - Novice: Makes frequent mistakes and has slow reaction time
  - Intermediate: Performs consistently well but still makes occasional errors
  - Expert: Plays nearly perfectly with strategic prioritization of golden eggs
- **Special Egg Types**:
  - Regular Eggs: Worth 1 point each
  - Golden Eggs: Worth 3 points each
  - Bomb Eggs: Penalize you if caught (-2 points)
- **Particle Effects** - Colorful visual feedback for egg catches, breaks, and bomb explosions
- **Sound Effects** - Satisfying audio feedback for all game actions
- **Responsive Controls** - Move your character left and right using arrow keys
- **Tutorial Mode** - Learn how to play the game with simple, visual instructions

## How to Play

1. Use the **Left and Right Arrow Keys** to move your character (blue)
2. Catch falling eggs by positioning your character beneath them
3. After catching an egg, it is automatically transferred to your basket
4. Try to catch the valuable golden eggs (worth 3 points)
5. Avoid the bomb eggs (they deduct 2 points if caught)
6. The player with the most points after 60 seconds wins!

## Technologies Used

- **Three.js** - For 3D rendering
- **Web Audio API** - For sound effects and music
- **HTML5/CSS3/JavaScript** - For UI and game logic

## Running the Game

Simply open `index.html` in a modern web browser. The game works best in Chrome, Firefox, or Edge.

1. Clone this repository or download the ZIP
2. Open the `index.html` file in your browser
3. Click "Start Game" to begin playing

## Development

If you want to modify or extend the game:

1. The main game logic is in `js/game.js`
2. AI players are controlled by code in `js/ai.js`
3. Particle effects are in `js/particles.js`
4. 3D models are created in `js/models.js`
5. Sound effects are in `js/audio.js`

## Credits

Created by Alex Meckes using Cursor .46 + Claude 3.7

- Twitter: [@AlexMeckes](https://twitter.com/AlexMeckes)
- GitHub: [alexmeckes](https://github.com/alexmeckes)

## License

This project is released under the MIT License. See the LICENSE file for details.

Enjoy the game! 