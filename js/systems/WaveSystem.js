// Wave System for Grimoire Gauntlet
class WaveSystem {
    constructor(gameScene) {
        this.scene = gameScene;
        this.currentWave = 1;
        this.waveData = null;
        this.enemiesRemaining = 0;
        this.isBossWave = false;
        this.spawnInterval = null;
        
        this.waveConfig = {
            baseEnemies: 3,
            enemiesPerWave: 1.5,
            bossWaveInterval: 5,
            spawnDelay: 1000, // ms between spawns
            waveStartDelay: 3000 // ms before wave starts
        };
    }
    
    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.isBossWave = (waveNumber % this.waveConfig.bossWaveInterval === 0);
        
        // Calculate number of enemies
        const enemyCount = this.calculateEnemyCount(waveNumber);
        this.enemiesRemaining = enemyCount;
        
        // Get enemy types for this wave
        const enemyTypes = this.getEnemyTypesForWave(waveNumber);
        
        // Show wave message
        this.scene.ui?.showWaveMessage(
            this.isBossWave ? `BOSS WAVE ${waveNumber}!` : `Wave ${waveNumber}`,
            2000
        );
        
        // Play wave start sound
        if (window.AUDIO_SYSTEM) {
            window.AUDIO_SYSTEM.playWaveStart();
        }
        
        // Start spawning after delay
        this.scene.time.delayedCall(this.waveConfig.waveStartDelay, () => {
            this.startSpawning(enemyTypes, enemyCount);
        });
        
        // Log
        this.scene.ui?.logMessage(
            `Wave ${waveNumber} started! ${enemyCount} ${this.isBossWave ? 'boss' : 'enemies'} approaching!`,
            'warning'
        );
        
        return {
            waveNumber,
            enemyCount,
            isBossWave: this.isBossWave,
            enemyTypes
        };
    }
    
    calculateEnemyCount(waveNumber) {
        if (this.isBossWave) {
            return 1; // Only boss
        }
        
        return Math.floor(
            this.waveConfig.baseEnemies + 
            (waveNumber - 1) * this.waveConfig.enemiesPerWave
        );
    }
    
    getEnemyTypesForWave(waveNumber) {
        const types = [];
        
        // Always have goblins
        types.push({
            type: CONSTANTS.ENEMY_TYPES.GOBLIN,
            weight: 50,
            minWave: 1
        });
        
        // Unlock brutes at wave 2
        if (waveNumber >= 2) {
            types.push({
                type: CONSTANTS.ENEMY_TYPES.BRUTE,
                weight: 30,
                minWave: 2
            });
        }
        
        // Unlock archers at wave 3
        if (waveNumber >= 3) {
            types.push({
                type: CONSTANTS.ENEMY_TYPES.ARCHER,
                weight: 15,
                minWave: 3
            });
        }
        
        // Unlock shamans at wave 4
        if (waveNumber >= 4) {
            types.push({
                type: CONSTANTS.ENEMY_TYPES.SHAMAN,
                weight: 5,
                minWave: 4
            });
        }
        
        return types;
    }
    
    startSpawning(enemyTypes, totalEnemies) {
        let spawned = 0;
        
        this.spawnInterval = this.scene.time.addEvent({
            delay: this.waveConfig.spawnDelay,
            callback: () => {
                if (spawned >= totalEnemies) {
                    this.spawnInterval.remove();
                    return;
                }
                
                this.spawnEnemy(enemyTypes);
                spawned++;
                
                // Update UI
                this.scene.ui?.logMessage(
                    `Enemy spawning... (${spawned}/${totalEnemies})`,
                    'info'
                );
            },
            callbackScope: this,
            repeat: totalEnemies - 1
        });
    }
    
    spawnEnemy(enemyTypes) {
        // Choose enemy type based on weights
        const type = this.chooseEnemyType(enemyTypes);
        
        // Spawn position (around edges of screen)
        const position = this.getSpawnPosition();
        
        // Create enemy
        const enemy = new Enemy(
            this.scene,
            position.x,
            position.y,
            type,
            this.currentWave
        );
        
        // Add to scene's enemy group
        if (this.scene.enemies) {
            this.scene.enemies.add(enemy);
        }
        
        // Spawn effect
        this.createSpawnEffect(position.x, position.y);
        
        return enemy;
    }
    
    chooseEnemyType(enemyTypes) {
        if (this.isBossWave) {
            return CONSTANTS.ENEMY_TYPES.BOSS;
        }
        
        const totalWeight = enemyTypes.reduce((sum, type) => sum + type.weight, 0);
        let random = Math.random() * totalWeight;
        let weightSum = 0;
        
        for (const enemyType of enemyTypes) {
            weightSum += enemyType.weight;
            if (random <= weightSum) {
                return enemyType.type;
            }
        }
        
        return CONSTANTS.ENEMY_TYPES.GOBLIN;
    }
    
    getSpawnPosition() {
        // Spawn around edges of screen
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        const padding = 50;
        
        switch(side) {
            case 0: // Top
                return {
                    x: Math.random() * (800 - padding * 2) + padding,
                    y: padding
                };
            case 1: // Right
                return {
                    x: 800 - padding,
                    y: Math.random() * (600 - padding * 2) + padding
                };
            case 2: // Bottom
                return {
                    x: Math.random() * (800 - padding * 2) + padding,
                    y: 600 - padding
                };
            case 3: // Left
                return {
                    x: padding,
                    y: Math.random() * (600 - padding * 2) + padding
                };
            default:
                return { x: 400, y: 100 };
        }
    }
    
    createSpawnEffect(x, y) {
        // Visual effect for enemy spawn
        const particles = this.scene.add.particles('particle_fire');
        
        particles.createEmitter({
            x: x,
            y: y,
            speed: { min: 10, max: 30 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 1000,
            quantity: 10
        });
        
        // Sound effect
        if (window.AUDIO_SYSTEM) {
            window.AUDIO_SYSTEM.playSfx('sfx_enemy_hit', { volume: 0.3 });
        }
    }
    
    enemyDefeated() {
        this.enemiesRemaining--;
        
        // Check if wave is complete
        if (this.enemiesRemaining <= 0) {
            this.waveComplete();
        }
    }
    
    waveComplete() {
        // Clear any ongoing spawn interval
        if (this.spawnInterval) {
            this.spawnInterval.remove();
        }
        
        // Show wave complete message
        this.scene.ui?.showWaveMessage(`Wave ${this.currentWave} Complete!`, 2000);
        
        // Award bonus for boss waves
        if (this.isBossWave) {
            this.scene.ui?.logMessage(
                `Boss defeated! Bonus XP awarded!`,
                'level'
            );
            
            // Give bonus XP to player
            if (this.scene.player) {
                this.scene.player.addXP(this.currentWave * 5); // Extra XP for boss
            }
        }
        
        // Log
        this.scene.ui?.logMessage(
            `Wave ${this.currentWave} completed! Prepare for next wave...`,
            'info'
        );
        
        // Save game
        if (this.scene.saveGame) {
            this.scene.saveGame();
        }
        
        // Start next wave after delay
        this.scene.time.delayedCall(3000, () => {
            this.currentWave++;
            this.startWave(this.currentWave);
        });
    }
    
    pause() {
        if (this.spawnInterval) {
            this.spawnInterval.paused = true;
        }
    }
    
    resume() {
        if (this.spawnInterval) {
            this.spawnInterval.paused = false;
        }
    }
    
    stop() {
        if (this.spawnInterval) {
            this.spawnInterval.remove();
            this.spawnInterval = null;
        }
        
        this.enemiesRemaining = 0;
    }
    
    // For saving/loading
    getWaveData() {
        return {
            currentWave: this.currentWave,
            enemiesRemaining: this.enemiesRemaining,
            isBossWave: this.isBossWave
        };
    }
    
    loadWaveData(data) {
        if (!data) return;
        
        this.currentWave = data.currentWave || 1;
        this.enemiesRemaining = data.enemiesRemaining || 0;
        this.isBossWave = data.isBossWave || false;
    }
}

// Make globally available
window.WaveSystem = WaveSystem;