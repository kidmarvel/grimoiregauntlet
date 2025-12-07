// Game Constants
const CONSTANTS = {
    // Game settings
    GAME_WIDTH: 800,
    GAME_HEIGHT: 600,
    GRID_SIZE: 40,
    
    // Player settings
    PLAYER_SPEED: 200,
    PLAYER_SIZE: 20,
    PLAYER_MAX_HP: 3,
    PLAYER_INVULNERABILITY_TIME: 1000,
    
    // Enemy settings
    ENEMY_TYPES: {
        GOBLIN: 'goblin',
        BRUTE: 'brute',
        ARCHER: 'archer',
        SHAMAN: 'shaman',
        BOSS: 'boss'
    },
    
    // Spell settings
    SPELLS: {
        FIREBOLT: 0,
        FROST_RAY: 1,
        PLASMA_ORB: 2,
        HEALING_LIGHT: 3
    },
    
    // Game states
    STATES: {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over'
    },
    
    // Zones
    ZONES: [
        { 
            name: "Forest of Beginnings", 
            background: "forest_bg",
            music: "forest_theme",
            color: "#2a5c2a"
        },
        { 
            name: "Ice Caverns", 
            background: "ice_cave_bg",
            music: "ice_theme",
            color: "#66ccff"
        },
        { 
            name: "Volcanic Depths", 
            background: "volcano_bg",
            music: "lava_theme",
            color: "#ff4422"
        }
    ],
    
    // Save key
    SAVE_KEY: "grimoire_gauntlet_v3"
};

// Colors
const COLORS = {
    PLAYER: "#f6ff00",
    ENEMY_GOBLIN: "#00fc08",
    ENEMY_BRUTE: "#000087",
    ENEMY_ARCHER: "#fc3b00",
    ENEMY_SHAMAN: "#00bbff",
    ENEMY_BOSS: "#D32F2F",
    
    SPELL_FIRE: "#ff4422",
    SPELL_ICE: "#66ccff",
    SPELL_PLASMA: "#cc66ff",
    SPELL_HEAL: "#aaffaa",
    
    UI_HEALTH: "#ff4455",
    UI_XP: "#ffcc00",
    UI_PRIMARY: "#7c6afe",
    UI_ACCENT: "#c066ff"
};

// Export to global scope
window.CONSTANTS = CONSTANTS;
window.COLORS = COLORS;