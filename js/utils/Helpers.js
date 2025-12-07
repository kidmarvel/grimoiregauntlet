// Utility functions for Grimoire Gauntlet
class Helpers {
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }
    
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    static weightedRandom(weights) {
        let totalWeight = 0;
        for (const weight of Object.values(weights)) {
            totalWeight += weight;
        }
        
        let random = Math.random() * totalWeight;
        let weightSum = 0;
        
        for (const [key, weight] of Object.entries(weights)) {
            weightSum += weight;
            if (random <= weightSum) {
                return key;
            }
        }
        
        return Object.keys(weights)[0];
    }
    
    static lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }
    
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    static distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    
    static angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    static createParticles(scene, x, y, texture, count, config = {}) {
        const particles = scene.add.particles(texture);
        
        const emitterConfig = {
            x: x,
            y: y,
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            quantity: count,
            ...config
        };
        
        return particles.createEmitter(emitterConfig);
    }
    
    static shakeCamera(scene, intensity = 0.01, duration = 100) {
        scene.cameras.main.shake(duration, intensity);
    }
    
    static flashSprite(sprite, color = 0xffffff, duration = 100) {
        const originalTint = sprite.tintTopLeft;
        sprite.setTint(color);
        
        setTimeout(() => {
            sprite.clearTint();
        }, duration);
    }
}

// Make globally available
window.Helpers = Helpers;