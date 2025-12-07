class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }
    
    preload() {
        // Display loading progress
        this.createProgressBar();
        
        // Load assets
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
            assetText.setText('Loading asset: ' + file.key);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });
    }
    
    // In loadAssets() method, replace with:
loadAssets() {
    // Don't load missing files - use placeholder graphics
    console.log("Using placeholder graphics instead of loading files");
    
    // Create simple placeholder textures
    this.createPlaceholderTextures();
}

createPlaceholderTextures() {
    // Create simple colored rectangles as textures
    const createColorTexture = (key, color, width, height) => {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    };
    
    // Player
    createColorTexture('player_idle', 0xf6ff00, 64, 64);
    createColorTexture('player_run', 0xf6ff00, 64, 64);
    
    // Enemies
    createColorTexture('enemy_goblin', 0x00fc08, 48, 48);
    createColorTexture('enemy_brute', 0x000087, 64, 64);
    createColorTexture('enemy_archer', 0xfc3b00, 48, 48);
    createColorTexture('enemy_shaman', 0x00bbff, 56, 56);
    createColorTexture('enemy_boss', 0xD32F2F, 96, 96);
    
    // Projectiles
    createColorTexture('projectile_fire', 0xff4422, 32, 32);
    createColorTexture('projectile_ice', 0x66ccff, 32, 32);
    createColorTexture('projectile_plasma', 0xcc66ff, 32, 32);
    createColorTexture('projectile_heal', 0xaaffaa, 32, 32);
    
    // Particles
    createColorTexture('particle_fire', 0xff4422, 16, 16);
    createColorTexture('particle_ice', 0x66ccff, 16, 16);
    createColorTexture('particle_heal', 0xaaffaa, 16, 16);
    createColorTexture('particle_hit', 0xffffff, 16, 16);
    
    // Backgrounds
    createColorTexture('forest_bg', 0x2a5c2a, 800, 600);
    createColorTexture('ice_cave_bg', 0x66ccff, 800, 600);
    createColorTexture('volcano_bg', 0xff4422, 800, 600);
    
    // UI
    createColorTexture('ui_health_bar', 0xff4455, 300, 20);
    createColorTexture('ui_xp_bar', 0xffcc00, 300, 15);
    createColorTexture('ui_spell_slot', 0x7c6afe, 80, 80);
    
    console.log("Created placeholder textures");
}

// Also update the audio section to not fail on missing sounds
create() {
    // Create animations using our placeholder textures
    this.createAnimations();
    
    // Initialize systems without audio for now
    this.initSystemsWithoutAudio();
    
    // Go to main menu
    this.scene.start('MainMenuScene');
}

initSystemsWithoutAudio() {
    // Simple audio system that doesn't require files
    window.AUDIO_SYSTEM = {
        playMusic: () => console.log("Music would play"),
        playSfx: () => console.log("SFX would play"),
        init: () => console.log("Audio system ready (placeholders)")
    };
}
    
    create() {
        // Create animations
        this.createAnimations();
        
        // Initialize systems
        this.initSystems();
        
        // Go to main menu
        this.scene.start('MainMenuScene');
    }
    
    createAnimations() {
        // Player animations
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });
        
        this.anims.create({
            key: 'player_run',
            frames: this.anims.generateFrameNumbers('player_run', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Enemy animations
        ['goblin', 'brute', 'archer', 'shaman', 'boss'].forEach(enemyType => {
            this.anims.create({
                key: `${enemyType}_idle`,
                frames: this.anims.generateFrameNumbers(`enemy_${enemyType}`, { start: 0, end: 3 }),
                frameRate: 4,
                repeat: -1
            });
            
            this.anims.create({
                key: `${enemyType}_walk`,
                frames: this.anims.generateFrameNumbers(`enemy_${enemyType}`, { start: 4, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
        });
    }
    
    initSystems() {
        // Initialize audio system
        window.AUDIO_SYSTEM = {
            music: null,
            sfx: {},
            
            init: function(scene) {
                this.scene = scene;
                
                // Create music instance
                this.music = scene.sound.add('music_main', {
                    loop: true,
                    volume: 0.3
                });
                
                // Create SFX instances
                this.sfx = {
                    fire_cast: scene.sound.add('sfx_fire_cast'),
                    ice_cast: scene.sound.add('sfx_ice_cast'),
                    heal_cast: scene.sound.add('sfx_heal_cast'),
                    thunder_cast: scene.sound.add('sfx_thunder_cast'),
                    level_up: scene.sound.add('sfx_level_up'),
                    enemy_hit: scene.sound.add('sfx_enemy_hit'),
                    player_hit: scene.sound.add('sfx_player_hit'),
                    wave_start: scene.sound.add('sfx_wave_start')
                }

// In AudioSystem.js or PreloadScene.js, add:
playSfx(key) {
    console.log(`[SFX] ${key}`);
    // Don't actually play anything until we have files
    return null;
}

playMusic(key) {
    console.log(`[Music] ${key}`);
    return null;
}
                
                // Set SFX volume
                Object.values(this.sfx).forEach(sound => {
                    sound.volume = 0.5;
                });
            },
            
            playMusic: function(key) {
                if (!GAME_DATA.settings.musicEnabled) return;
                
                if (this.music.key !== key) {
                    this.music.stop();
                    this.music = this.scene.sound.add(key, {
                        loop: true,
                        volume: 0.3
                    });
                }
                
                if (!this.music.isPlaying) {
                    this.music.play();
                }
            },
            
            playSfx: function(key) {
                if (!GAME_DATA.settings.sfxEnabled) return;
                
                if (this.sfx[key]) {
                    this.sfx[key].play();
                }
            },
            
            toggleMusic: function() {
                GAME_DATA.settings.musicEnabled = !GAME_DATA.settings.musicEnabled;
                
                if (GAME_DATA.settings.musicEnabled) {
                    this.music.play();
                } else {
                    this.music.pause();
                }
                
                this.saveSettings();
                return GAME_DATA.settings.musicEnabled;
            },
            
            toggleSfx: function() {
                GAME_DATA.settings.sfxEnabled = !GAME_DATA.settings.sfxEnabled;
                this.saveSettings();
                return GAME_DATA.settings.sfxEnabled;
            },
            
            saveSettings: function() {
                localStorage.setItem('gg_settings_v3', JSON.stringify(GAME_DATA.settings));
            }
        };
    }
}
