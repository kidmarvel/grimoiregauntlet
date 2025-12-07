class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }
    
    create() {
        // Initialize audio
        AUDIO_SYSTEM.init(this);
        
        // Play main theme
        AUDIO_SYSTEM.playMusic('music_main');
        
        // Set up background
        this.createBackground();
        
        // Bind UI events
        this.bindUIEvents();
        
        // Update stats display
        this.updateStatsDisplay();
        
        // Show the HTML menu
        this.showMenu();
    }
    
    createBackground() {
        // Add animated background particles
        this.particles = this.add.particles('particle_fire');
        
        this.emitter = this.particles.createEmitter({
            x: { min: 0, max: 800 },
            y: 600,
            speed: { min: 50, max: 100 },
            angle: { min: 180, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 2000,
            frequency: 100
        });
        
        // Add some floating runes
        for (let i = 0; i < 10; i++) {
            const rune = this.add.sprite(
                Phaser.Math.Between(50, 750),
                Phaser.Math.Between(50, 550),
                'projectile_plasma'
            ).setAlpha(0.3);
            
            this.tweens.add({
                targets: rune,
                y: rune.y - 100,
                duration: 3000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
                delay: i * 300
            });
        }
    }
    
    bindUIEvents() {
        // New Game button
        document.getElementById('fightBtn').onclick = () => {
            AUDIO_SYSTEM.playSfx('wave_start');
            this.startNewGame();
        };
        
        // Continue button
        document.getElementById('loadBtn').onclick = () => {
            this.loadGame();
        };
        
        // How to Play button
        document.getElementById('howToPlayBtn').onclick = () => {
            document.getElementById('howToPlayModal').classList.add('active');
        };
        
        // Credits button
        document.getElementById('creditsBtn').onclick = () => {
            document.getElementById('creditsModal').classList.add('active');
        };
        
        // Audio controls
        document.getElementById('audioToggle').onclick = () => {
            const enabled = AUDIO_SYSTEM.toggleMusic();
            document.getElementById('audioToggle').innerHTML = 
                enabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
        };
        
        document.getElementById('sfxToggle').onclick = () => {
            const enabled = AUDIO_SYSTEM.toggleSfx();
            document.getElementById('sfxToggle').innerHTML = 
                enabled ? '<i class="fas fa-volume"></i>' : '<i class="fas fa-volume-mute"></i>';
        };
        
        document.getElementById('fullscreenBtn').onclick = () => {
            if (!this.scale.isFullscreen) {
                this.scale.startFullscreen();
            } else {
                this.scale.stopFullscreen();
            }
        };
        
        // Modal close buttons
        document.getElementById('closeHowToPlay').onclick = () => {
            document.getElementById('howToPlayModal').classList.remove('active');
        };
        
        document.getElementById('closeCredits').onclick = () => {
            document.getElementById('creditsModal').classList.remove('active');
        };
    }
    
    updateStatsDisplay() {
        const saveData = this.loadSaveData();
        
        if (saveData) {
            document.getElementById('highestWave').textContent = saveData.highestWave || 0;
            document.getElementById('totalSpells').textContent = saveData.spellsUnlocked?.length || 0;
            
            // Calculate play time
            const hours = Math.floor((saveData.totalPlayTime || 0) / 3600);
            const minutes = Math.floor(((saveData.totalPlayTime || 0) % 3600) / 60);
            document.getElementById('playTime').textContent = `${hours}h ${minutes}m`;
        }
    }
    
    loadSaveData() {
        try {
            const saved = localStorage.getItem(CONSTANTS.SAVE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.warn('Failed to load save data:', e);
            return null;
        }
    }
    
    startNewGame() {
        // Hide menu
        this.hideMenu();
        
        // Start game scene
        this.scene.start('GameScene', { newGame: true });
    }
    
    loadGame() {
        const saveData = this.loadSaveData();
        
        if (!saveData) {
            alert('No saved game found! Starting new game.');
            this.startNewGame();
            return;
        }
        
        // Hide menu
        this.hideMenu();
        
        // Start game with loaded data
        this.scene.start('GameScene', { newGame: false, saveData });
    }
    
    showMenu() {
        document.getElementById('mainMenu').classList.add('active');
        document.getElementById('gameUI').classList.remove('active');
    }
    
    hideMenu() {
        document.getElementById('mainMenu').classList.remove('active');
    }
}