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
    console.log('Initializing Grimoire Gauntlet v3...');
    
    // Check if required scenes are defined
    if (!window.BootScene || !window.PreloadScene || !window.MainMenuScene || 
        !window.GameScene || !window.GameOverScene) {
        console.error('Missing scene definitions! Check console for errors.');
        
        // Try to load them manually
        loadMissingScenes();
        return;
    }
    
    try {
        game = new Phaser.Game(config);
        
        // Make game instance globally accessible
        window.GrimoireGauntlet = {
            game: game,
            scenes: {},
            systems: {},
            data: {}
        };
        
        console.log('Game initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        alert('Failed to start game: ' + error.message);
    }
});

// Fallback function if scenes aren't loaded
function loadMissingScenes() {
    console.log('Attempting to load missing scenes...');
    
    // Check which scenes are missing
    const missing = [];
    if (!window.BootScene) missing.push('BootScene');
    if (!window.PreloadScene) missing.push('PreloadScene');
    if (!window.MainMenuScene) missing.push('MainMenuScene');
    if (!window.GameScene) missing.push('GameScene');
    if (!window.GameOverScene) missing.push('GameOverScene');
    
    console.error('Missing scenes:', missing);
    alert(`Missing scenes: ${missing.join(', ')}\nCheck browser console for errors.`);
}
