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
    
    loadAssets() {
        // Load player sprites
        this.load.spritesheet('player_idle', 'assets/images/characters/player_idle.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        
        this.load.spritesheet('player_run', 'assets/images/characters/player_run.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        
        // Load enemy sprites
        this.load.spritesheet('enemy_goblin', 'assets/images/characters/enemy_goblin.png', {
            frameWidth: 48,
            frameHeight: 48
        });
        
        this.load.spritesheet('enemy_brute', 'assets/images/characters/enemy_brute.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        
        this.load.spritesheet('enemy_archer', 'assets/images/characters/enemy_archer.png', {
            frameWidth: 48,
            frameHeight: 48
        });
        
        this.load.spritesheet('enemy_shaman', 'assets/images/characters/enemy_shaman.png', {
            frameWidth: 56,
            frameHeight: 56
        });
        
        this.load.spritesheet('enemy_boss', 'assets/images/characters/enemy_boss.png', {
            frameWidth: 96,
            frameHeight: 96
        });
        
        // Load spell effects
        this.load.image('projectile_fire', 'assets/images/effects/fireball.png');
        this.load.image('projectile_ice', 'assets/images/effects/icebolt.png');
        this.load.image('projectile_plasma', 'assets/images/effects/plasma.png');
        this.load.image('projectile_heal', 'assets/images/effects/healing.png');
        
        // Load backgrounds
        this.load.image('forest_bg', 'assets/images/backgrounds/forest.jpg');
        this.load.image('ice_cave_bg', 'assets/images/backgrounds/ice_cave.jpg');
        this.load.image('volcano_bg', 'assets/images/backgrounds/volcano.jpg');
        
        // Load UI elements
        this.load.image('ui_health_bar', 'assets/images/ui/health_bar.png');
        this.load.image('ui_xp_bar', 'assets/images/ui/xp_bar.png');
        this.load.image('ui_spell_slot', 'assets/images/ui/spell_slot.png');
        
        // Load sounds
        this.load.audio('music_main', 'assets/sounds/main_theme.mp3');
        this.load.audio('music_forest', 'assets/sounds/forest_theme.mp3');
        this.load.audio('music_ice', 'assets/sounds/ice_theme.mp3');
        this.load.audio('music_lava', 'assets/sounds/lava_theme.mp3');
        
        this.load.audio('sfx_fire_cast', 'assets/sounds/fire_cast.wav');
        this.load.audio('sfx_ice_cast', 'assets/sounds/ice_cast.wav');
        this.load.audio('sfx_heal_cast', 'assets/sounds/heal_cast.wav');
        this.load.audio('sfx_thunder_cast', 'assets/sounds/thunder_cast.wav');
        this.load.audio('sfx_level_up', 'assets/sounds/level_up.wav');
        this.load.audio('sfx_enemy_hit', 'assets/sounds/enemy_hit.wav');
        this.load.audio('sfx_player_hit', 'assets/sounds/player_hit.wav');
        this.load.audio('sfx_wave_start', 'assets/sounds/wave_start.wav');
        
        // Load particle textures
        this.load.image('particle_fire', 'assets/images/effects/particle_fire.png');
        this.load.image('particle_ice', 'assets/images/effects/particle_ice.png');
        this.load.image('particle_heal', 'assets/images/effects/particle_heal.png');
        this.load.image('particle_hit', 'assets/images/effects/particle_hit.png');
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
                };
                
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