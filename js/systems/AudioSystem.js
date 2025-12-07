// Audio System for Grimoire Gauntlet
class AudioSystem {
    constructor(scene) {
        this.scene = scene;
        this.music = null;
        this.sfx = {};
        this.settings = SaveSystem.loadSettings();
        
        this.init();
    }
    
    init() {
        // Preload audio files (they should already be loaded by Phaser)
        // We'll create sound instances when needed
        
        // Set initial volume
        this.updateVolume();
    }
    
    updateVolume() {
        // Phaser handles volume at the sound level
        // We'll apply volume when playing sounds
    }
    
    playMusic(key, config = {}) {
        if (!this.settings.musicEnabled) return null;
        
        // Stop current music if playing
        if (this.music && this.music.isPlaying) {
            this.music.stop();
        }
        
        // Create and play new music
        this.music = this.scene.sound.add(key, {
            loop: true,
            volume: this.settings.volume * 0.3, // Music is quieter
            ...config
        });
        
        this.music.play();
        return this.music;
    }
    
    stopMusic() {
        if (this.music && this.music.isPlaying) {
            this.music.stop();
        }
    }
    
    pauseMusic() {
        if (this.music && this.music.isPlaying) {
            this.music.pause();
        }
    }
    
    resumeMusic() {
        if (this.music && !this.music.isPlaying) {
            this.music.resume();
        }
    }
    
    playSfx(key, config = {}) {
        if (!this.settings.sfxEnabled) return null;
        
        // Create or reuse SFX instance
        if (!this.sfx[key]) {
            this.sfx[key] = this.scene.sound.add(key, {
                volume: this.settings.volume * 0.5,
                ...config
            });
        }
        
        // Play the sound
        this.sfx[key].play();
        return this.sfx[key];
    }
    
    playSfxAt(key, x, y, config = {}) {
        if (!this.settings.sfxEnabled) return null;
        
        // Play spatial audio (simple implementation)
        const sound = this.playSfx(key, config);
        
        if (sound) {
            // Simple panning based on x position
            const screenCenter = this.scene.cameras.main.centerX;
            const pan = (x - screenCenter) / screenCenter;
            sound.setPan(Helpers.clamp(pan, -1, 1));
        }
        
        return sound;
    }
    
    toggleMusic() {
        this.settings.musicEnabled = !this.settings.musicEnabled;
        SaveSystem.saveSettings(this.settings);
        
        if (this.settings.musicEnabled) {
            this.resumeMusic();
        } else {
            this.pauseMusic();
        }
        
        return this.settings.musicEnabled;
    }
    
    toggleSfx() {
        this.settings.sfxEnabled = !this.settings.sfxEnabled;
        SaveSystem.saveSettings(this.settings);
        return this.settings.sfxEnabled;
    }
    
    setVolume(volume) {
        this.settings.volume = Helpers.clamp(volume, 0, 1);
        SaveSystem.saveSettings(this.settings);
        this.updateVolume();
    }
    
    increaseVolume(amount = 0.1) {
        this.setVolume(this.settings.volume + amount);
    }
    
    decreaseVolume(amount = 0.1) {
        this.setVolume(this.settings.volume - amount);
    }
    
    // Special sound effects for game events
    playSpellCast(spellType) {
        switch(spellType) {
            case 'fire':
                return this.playSfx('sfx_fire_cast');
            case 'ice':
                return this.playSfx('sfx_ice_cast');
            case 'heal':
                return this.playSfx('sfx_heal_cast');
            case 'thunder':
                return this.playSfx('sfx_thunder_cast');
            default:
                return this.playSfx('sfx_fire_cast');
        }
    }
    
    playEnemyHit() {
        return this.playSfx('sfx_enemy_hit');
    }
    
    playPlayerHit() {
        return this.playSfx('sfx_player_hit');
    }
    
    playLevelUp() {
        return this.playSfx('sfx_level_up');
    }
    
    playWaveStart() {
        return this.playSfx('sfx_wave_start');
    }
    
    playGameOver() {
        // Play a sad sound or keep silent for dramatic effect
        this.stopMusic();
        return this.playSfx('sfx_player_hit', { volume: 0.3 });
    }
    
    // Zone-specific music
    playZoneMusic(zoneIndex) {
        const zones = [
            { music: 'music_forest' },
            { music: 'music_ice' },
            { music: 'music_lava' }
        ];
        
        const zone = zones[zoneIndex] || zones[0];
        return this.playMusic(zone.music);
    }
}

// Make globally available
window.AudioSystem = AudioSystem;