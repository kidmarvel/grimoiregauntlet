class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }
    
    preload() {
        // Load minimal assets for loading screen
        this.load.image('loading_bg', 'assets/images/ui/loading_bg.png');
        this.load.image('loading_bar', 'assets/images/ui/loading_bar.png');
        
        // Load fonts
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }
    
    create() {
        // Initialize global game data
        this.initGameData();
        
        // Create loading screen
        this.createLoadingScreen();
        
        // Start preload scene
        this.scene.start('PreloadScene');
    }
    
    initGameData() {
        // Initialize global game state
        window.GAME_DATA = {
            settings: {
                musicEnabled: true,
                sfxEnabled: true,
                volume: 0.5
            },
            player: {
                highestWave: 0,
                totalPlayTime: 0,
                spellsUnlocked: 0
            },
            currentGame: null
        };
        
        // Load saved settings
        this.loadSettings();
    }
    
    loadSettings() {
        const saved = localStorage.getItem('gg_settings_v3');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.assign(window.GAME_DATA.settings, data);
            } catch (e) {
                console.warn('Failed to load settings:', e);
            }
        }
    }
    
    createLoadingScreen() {
        // Add background
        this.add.image(400, 300, 'loading_bg');
        
        // Loading bar background
        const barBg = this.add.rectangle(400, 400, 400, 30, 0x222233);
        const bar = this.add.rectangle(400, 400, 0, 24, 0x7c6afe);
        
        // Loading text
        const text = this.add.text(400, 350, 'Loading Ancient Spells...', {
            fontFamily: 'MedievalSharp',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Update loading bar
        this.load.on('progress', (value) => {
            bar.width = 396 * value;
        });
        
        this.load.on('complete', () => {
            bar.width = 396;
            text.setText('Ready for Battle!');
        });
    }
}