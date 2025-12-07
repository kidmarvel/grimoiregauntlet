// Game Over Scene
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }
    
    init(data) {
        // Receive game stats from previous scene
        this.gameStats = data || {
            wave: 1,
            level: 1,
            score: 0,
            enemiesKilled: 0,
            playTime: 0
        };
    }
    
    create() {
        // Stop any music
        if (window.AUDIO_SYSTEM) {
            window.AUDIO_SYSTEM.stopMusic();
            window.AUDIO_SYSTEM.playGameOver();
        }
        
        // Create dark background
        this.createBackground();
        
        // Show game over UI
        this.showGameOverUI();
        
        // Bind buttons
        this.bindEvents();
        
        // Update global stats
        this.updateGlobalStats();
    }
    
    createBackground() {
        // Dark overlay
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        
        // Animated particles
        const particles = this.add.particles('particle_hit');
        
        particles.createEmitter({
            x: { min: 0, max: 800 },
            y: 600,
            speed: { min: 50, max: 100 },
            angle: { min: 180, max: 360 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.3, end: 0 },
            lifespan: 2000,
            frequency: 200
        });
        
        // Flickering text effect
        this.time.addEvent({
            delay: 500,
            callback: () => {
                this.createTextEffect();
            },
            callbackScope: this,
            loop: true
        });
    }
    
    createTextEffect() {
        // Create random floating text fragments
        const words = ["DEFEAT", "GAME OVER", "TRY AGAIN", "VALIANT EFFORT"];
        const word = Phaser.Utils.Array.GetRandom(words);
        
        const x = Phaser.Math.Between(100, 700);
        const y = Phaser.Math.Between(100, 500);
        
        const text = this.add.text(x, y, word, {
            fontFamily: 'MedievalSharp',
            fontSize: '24px',
            color: '#ff4455'
        }).setAlpha(0).setOrigin(0.5);
        
        // Fade in and out
        this.tweens.add({
            targets: text,
            alpha: 1,
            duration: 500,
            yoyo: true,
            onComplete: () => text.destroy()
        });
    }
    
    showGameOverUI() {
        // We'll use the HTML modal, but add some Phaser effects
        
        // Show the modal
        document.getElementById('gameOverModal').classList.add('active');
        
        // Update stats in the modal
        document.getElementById('defeatWave').textContent = this.gameStats.wave;
        document.getElementById('defeatLevel').textContent = this.gameStats.level;
        document.getElementById('defeatSpells').textContent = this.gameStats.spellsUnlocked || 2;
        
        // Add Phaser text overlay
        this.add.text(400, 150, 'GAME OVER', {
            fontFamily: 'Uncial Antiqua',
            fontSize: '64px',
            color: '#ff4455',
            stroke: '#000000',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 8, fill: true }
        }).setOrigin(0.5);
        
        // Stats display
        this.add.text(400, 250, `Wave: ${this.gameStats.wave}`, {
            fontFamily: 'MedievalSharp',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.add.text(400, 300, `Level: ${this.gameStats.level}`, {
            fontFamily: 'MedievalSharp',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.add.text(400, 350, `Enemies Defeated: ${this.gameStats.enemiesKilled || 0}`, {
            fontFamily: 'MedievalSharp',
            fontSize: '24px',
            color: '#cccccc'
        }).setOrigin(0.5);
    }
    
    bindEvents() {
        // Restart button
        document.getElementById('restartBtn').onclick = () => {
            this.restartGame();
        };
        
        // Menu button
        document.getElementById('menuBtn').onclick = () => {
            this.returnToMenu();
        };
        
        // Also bind keyboard
        this.input.keyboard.on('keydown-ENTER', () => {
            this.restartGame();
        });
        
        this.input.keyboard.on('keydown-ESC', () => {
            this.returnToMenu();
        });
    }
    
    restartGame() {
        // Hide modal
        document.getElementById('gameOverModal').classList.remove('active');
        
        // Restart game scene
        this.scene.start('GameScene', { newGame: true });
    }
    
    returnToMenu() {
        // Hide modal
        document.getElementById('gameOverModal').classList.remove('active');
        
        // Return to main menu
        this.scene.start('MainMenuScene');
    }
    
    updateGlobalStats() {
        // Update highest wave if needed
        if (this.gameStats.wave > GAME_DATA.player.highestWave) {
            GAME_DATA.player.highestWave = this.gameStats.wave;
            
            // Save to localStorage
            const settings = SaveSystem.loadSettings();
            settings.highestWave = this.gameStats.wave;
            SaveSystem.saveSettings(settings);
        }
        
        // Update total play time
        GAME_DATA.player.totalPlayTime += this.gameStats.playTime || 0;
    }
}

// Make globally available
window.GameOverScene = GameOverScene;