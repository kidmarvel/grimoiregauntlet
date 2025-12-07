// Phaser Game Configuration
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 600,
    backgroundColor: '#05040f',
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        GameScene,
        GameOverScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    dom: {
        createContainer: true
    },
    input: {
        activePointers: 3
    }
};

// Global Game Instance
let game;

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    game = new Phaser.Game(config);
    
    // Make game instance globally accessible
    window.GrimoireGauntlet = {
        game: game,
        scenes: {},
        systems: {},
        data: {}
    };
});