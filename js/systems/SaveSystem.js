// Save/Load system for Grimoire Gauntlet
class SaveSystem {
    static SAVE_KEY = "grimoire_gauntlet_v3";
    static SETTINGS_KEY = "gg_settings_v3";
    
    static saveGame(gameData) {
        try {
            const saveData = {
                version: 3,
                timestamp: Date.now(),
                ...gameData
            };
            
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('Failed to save game:', e);
            return false;
        }
    }
    
    static loadGame() {
        try {
            const saved = localStorage.getItem(this.SAVE_KEY);
            if (!saved) return null;
            
            const data = JSON.parse(saved);
            
            // Check version compatibility
            if (data.version !== 3) {
                console.warn(`Save version mismatch: ${data.version} != 3`);
                return this.migrateSave(data);
            }
            
            return data;
        } catch (e) {
            console.error('Failed to load game:', e);
            return null;
        }
    }
    
    static migrateSave(oldData) {
        // Handle migration from older versions
        console.log('Migrating save data from version', oldData.version);
        
        // Default migration - start fresh
        return null;
    }
    
    static saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            return false;
        }
    }
    
    static loadSettings() {
        try {
            const saved = localStorage.getItem(this.SETTINGS_KEY);
            if (!saved) return this.getDefaultSettings();
            
            return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load settings:', e);
            return this.getDefaultSettings();
        }
    }
    
    static getDefaultSettings() {
        return {
            musicEnabled: true,
            sfxEnabled: true,
            volume: 0.5,
            fullscreen: false,
            controls: {
                spell1: 'ONE',
                spell2: 'TWO',
                spell3: 'THREE',
                spell4: 'FOUR',
                pause: 'ESC'
            }
        };
    }
    
    static deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            return true;
        } catch (e) {
            console.error('Failed to delete save:', e);
            return false;
        }
    }
    
    static getSaveInfo() {
        const saved = this.loadGame();
        
        if (!saved) {
            return {
                exists: false,
                wave: 0,
                level: 0,
                timestamp: null
            };
        }
        
        return {
            exists: true,
            wave: saved.game?.wave || 0,
            level: saved.player?.level || 0,
            timestamp: saved.timestamp ? new Date(saved.timestamp) : null,
            playTime: saved.game?.playTime || 0
        };
    }
    
    static exportSave() {
        const saveData = localStorage.getItem(this.SAVE_KEY);
        const settingsData = localStorage.getItem(this.SETTINGS_KEY);
        
        return JSON.stringify({
            save: saveData,
            settings: settingsData
        });
    }
    
    static importSave(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.save) {
                localStorage.setItem(this.SAVE_KEY, data.save);
            }
            
            if (data.settings) {
                localStorage.setItem(this.SETTINGS_KEY, data.settings);
            }
            
            return true;
        } catch (e) {
            console.error('Failed to import save:', e);
            return false;
        }
    }
}

// Make globally available
window.SaveSystem = SaveSystem;