class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }
    
    preload() {
        // Display loading progress
        this.createProgressBar();
        
        // Load assets OR create placeholders
        this.loadAssets();
    }
    
    createProgressBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Progress bar background
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);
        
        // Loading text
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px MedievalSharp',
                fill: '#ffffff'
            }
        }).setOrigin(0.5);
        
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px MedievalSharp',
                fill: '#ffffff'
            }
        }).setOrigin(0.5);
        
        const assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '18px MedievalSharp',
                fill: '#ffffff'
            }
        }).setOrigin(0.5);
        
        // Update progress
        this.load.on('progress', (value) => {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0x7c6afe, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
        });
        
        this.load.on('fileprogress', (file) => {
            assetText.setText('Loading: ' + file.key);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });
    }
    
    loadAssets() {
        // Create placeholder textures instead of loading files
        this.createPlaceholderTextures();
        
        // Create silent audio system
        this.createAudioPlaceholder();
        
        // Mark loading complete immediately since we're using placeholders
        this.load.emit('progress', 1);
        this.load.emit('complete');
    }
    
    createPlaceholderTextures() {
        console.log("Creating placeholder textures...");
        
        // Helper function to create colored rectangle textures
        const createColorTexture = (key, color, width, height) => {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(color, 1);
            graphics.fillRect(0, 0, width, height);
            
            // Add a border
            graphics.lineStyle(2, 0x000000, 1);
            graphics.strokeRect(0, 0, width, height);
            
            // Add label for debugging
            graphics.fillStyle(0xffffff, 1);
            graphics.font = '10px Arial';
            graphics.fillText(key, 5, height - 5);
            
            graphics.generateTexture(key, width, height);
            graphics.destroy();
        };
        
        // Player textures
        createColorTexture('player_idle', 0xf6ff00, 64, 64);
        createColorTexture('player_run', 0xf6ff00, 64, 64);
        
        // Enemy textures
        createColorTexture('enemy_goblin', 0x00fc08, 48, 48);
        createColorTexture('enemy_brute', 0x000087, 64, 64);
        createColorTexture('enemy_archer', 0xfc3b00, 48, 48);
        createColorTexture('enemy_shaman', 0x00bbff, 56, 56);
        createColorTexture('enemy_boss', 0xD32F2F, 96, 96);
        
        // Projectile textures
        createColorTexture('projectile_fire', 0xff4422, 32, 32);
        createColorTexture('projectile_ice', 0x66ccff, 32, 32);
        createColorTexture('projectile_plasma', 0xcc66ff, 32, 32);
        createColorTexture('projectile_heal', 0xaaffaa, 32, 32);
        
        // Particle textures
        createColorTexture('particle_fire', 0xff4422, 16, 16);
        createColorTexture('particle_ice', 0x66ccff, 16, 16);
        createColorTexture('particle_heal', 0xaaffaa, 16, 16);
        createColorTexture('particle_hit', 0xffffff, 16, 16);
        
        // Background textures
        createColorTexture('forest_bg', 0x2a5c2a, 800, 600);
        createColorTexture('ice_cave_bg', 0x66ccff, 800, 600);
        createColorTexture('volcano_bg', 0xff4422, 800, 600);
        
        // UI textures (optional - our HTML handles most UI)
        createColorTexture('ui_health_bar', 0xff4455, 300, 20);
        createColorTexture('ui_xp_bar', 0xffcc00, 300, 15);
        createColorTexture('ui_spell_slot', 0x7c6afe, 80, 80);
        
        console.log("Placeholder textures created successfully");
    }
    
    createAudioPlaceholder() {
        // Create a simple audio system that doesn't require files
        window.AUDIO_SYSTEM = {
            music: null,
            sfx: {},
            
            init: function(scene) {
                this.scene = scene;
                console.log("Audio system initialized (placeholders)");
            },
            
            playMusic: function(key) {
                console.log(`[MUSIC] ${key} (placeholder)`);
                return null;
            },
            
            playSfx: function(key) {
                console.log(`[SFX] ${key} (placeholder)`);
                return null;
            },
            
            playSfxAt: function(key, x, y) {
                console.log(`[SFX at ${x},${y}] ${key} (placeholder)`);
                return null;
            },
            
            toggleMusic: function() {
                console.log("Toggle music (placeholder)");
                return true;
            },
            
            toggleSfx: function() {
                console.log("Toggle SFX (placeholder)");
                return true;
            },
            
            stopMusic: function() {
                console.log("Music stopped (placeholder)");
            },
            
            pauseMusic: function() {
                console.log("Music paused (placeholder)");
            },
            
            resumeMusic: function() {
                console.log("Music resumed (placeholder)");
            },
            
            // Special sound effects
            playSpellCast: function(spellType) {
                console.log(`[SPELL] ${spellType} cast`);
                return null;
            },
            
            playEnemyHit: function() {
                console.log("[ENEMY] Hit sound");
                return null;
            },
            
            playPlayerHit: function() {
                console.log("[PLAYER] Hit sound");
                return null;
            },
            
            playLevelUp: function() {
                console.log("[LEVEL UP] Sound");
                return null;
            },
            
            playWaveStart: function() {
                console.log("[WAVE START] Sound");
                return null;
            },
            
            playGameOver: function() {
                console.log("[GAME OVER] Sound");
                return null;
            },
            
            playZoneMusic: function(zoneIndex) {
                console.log(`[ZONE MUSIC] Zone ${zoneIndex}`);
                return null;
            }
        };
    }
    
    create() {
        // Create animations
        this.createAnimations();
        
        // Initialize audio system
        window.AUDIO_SYSTEM.init(this);
        
        // Go to main menu
        this.scene.start('MainMenuScene');
    }
    
    createAnimations() {
        console.log("Creating animations...");
        
        // Player animations
        this.anims.create({
            key: 'player_idle',
            frames: [{ key: 'player_idle', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player_run',
            frames: [{ key: 'player_run', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });
        
        // Enemy animations (simple placeholders)
        const enemyTypes = ['goblin', 'brute', 'archer', 'shaman', 'boss'];
        enemyTypes.forEach(type => {
            this.anims.create({
                key: `${type}_idle`,
                frames: [{ key: `enemy_${type}`, frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
            
            this.anims.create({
                key: `${type}_walk`,
                frames: [{ key: `enemy_${type}`, frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
        });
        
        console.log("Animations created successfully");
    }
}

// Make sure this class is available globally
window.PreloadScene = PreloadScene;
