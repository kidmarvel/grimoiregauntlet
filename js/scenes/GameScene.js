class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game state
        this.state = CONSTANTS.STATES.PLAYING;
        this.wave = 1;
        this.zoneIndex = 0;
        this.score = 0;
        this.enemiesKilled = 0;
        
        // Systems
        this.spellSystem = null;
        this.waveSystem = null;
    }
    
    init(data) {
        // Initialize from save data or new game
        if (data.newGame) {
            this.isNewGame = true;
            this.saveData = null;
        } else {
            this.isNewGame = false;
            this.saveData = data.saveData;
        }
    }
    
    create() {
        // Initialize systems
        this.initSystems();
        
        // Create game world
        this.createWorld();
        
        // Create player
        this.createPlayer();
        
        // Create enemies group
        this.createEnemies();
        
        // Create projectiles groups
        this.createProjectiles();
        
        // Setup collisions
        this.setupCollisions();
        
        // Setup input
        this.setupInput();
        
        // Setup UI
        this.setupUI();
        
        // Setup events
        this.setupEvents();
        
        // Start first wave
        this.startWave(this.wave);
        
        // Show game UI
        this.showGameUI();
    }
    
    initSystems() {
        // Initialize audio
        AUDIO_SYSTEM.init(this);
        
        // Play zone music
        const zoneMusic = CONSTANTS.ZONES[this.zoneIndex].music;
        AUDIO_SYSTEM.playMusic(zoneMusic);
        
        // Initialize spell system
        this.spellSystem = new SpellSystem(this);
        
        // Initialize wave system
        this.waveSystem = {
            isActive: false,
            enemiesRemaining: 0,
            spawnWave: (waveNumber) => {
                this.spawnWave(waveNumber);
            },
            waveComplete: () => {
                this.onWaveComplete();
            }
        };
    }
    
    createWorld() {
        // Set background
        const zone = CONSTANTS.ZONES[this.zoneIndex];
        this.add.image(400, 300, zone.background).setAlpha(0.7);
        
        // Add grid overlay (visual only)
        this.createGrid();
        
        // Set world bounds
        this.physics.world.setBounds(0, 0, 800, 600);
    }
    
    createGrid() {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x333344, 0.3);
        
        for (let x = 0; x < 800; x += CONSTANTS.GRID_SIZE) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, 600);
        }
        
        for (let y = 0; y < 600; y += CONSTANTS.GRID_SIZE) {
            graphics.moveTo(0, y);
            graphics.lineTo(800, y);
        }
        
        graphics.strokePath();
    }
    
    createPlayer() {
        this.player = new Player(this, 400, 500);
        
        // Initialize spell system with player
        this.spellSystem.init(this.player);
        
        // Set current target (will be updated when enemies spawn)
        this.currentTarget = null;
    }
    
    createEnemies() {
        this.enemies = this.physics.add.group({
            classType: Enemy,
            runChildUpdate: true
        });
    }
    
    createProjectiles() {
        // Player projectiles are managed by spell system
        
        // Enemy projectiles
        this.enemyProjectiles = this.physics.add.group();
    }
    
    setupCollisions() {
        // Player vs Enemy projectiles
        this.physics.add.overlap(
            this.player,
            this.enemyProjectiles,
            (player, projectile) => this.onPlayerHitByProjectile(player, projectile)
        );
        
        // Enemy projectiles vs world bounds
        this.enemyProjectiles.children.iterate(projectile => {
            projectile.setCollideWorldBounds(true);
            projectile.setBounce(1);
            projectile.worldCollide = true;
        });
    }
    
    setupInput() {
        // Pause game
        this.input.keyboard.on('keydown-ESC', () => this.togglePause());
        
        // Right click to switch targets
        this.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                this.switchTarget();
            }
        });
        
        // UI pause button
        document.getElementById('pauseBtn').onclick = () => this.togglePause();
    }
    
    setupUI() {
        // Update zone display
        document.getElementById('zoneName').textContent = 
            CONSTANTS.ZONES[this.zoneIndex].name;
            
        // Update wave display
        document.getElementById('currentWave').textContent = this.wave;
        
        // Clear log button
        document.getElementById('clearLogBtn').onclick = () => {
            document.getElementById('battleLog').innerHTML = '';
        };
    }
    
    setupEvents() {
        // Player events
        this.events.on('playerDamaged', (currentHp, maxHp) => {
            this.updateHealthBar(currentHp, maxHp);
            this.logMessage(`You took damage! HP: ${currentHp}/${maxHp}`);
        });
        
        this.events.on('playerHealed', (currentHp, maxHp) => {
            this.updateHealthBar(currentHp, maxHp);
            this.logMessage(`Healed! HP: ${currentHp}/${maxHp}`);
        });
        
        this.events.on('xpGained', (xp, xpToNext) => {
            this.updateXPBar(xp, xpToNext);
        });
        
        this.events.on('playerLevelUp', (level, skillPoints) => {
            this.logMessage(`Level up! Now level ${level}. ${skillPoints} skill points available!`);
            this.updateSkillPoints(skillPoints);
            
            // Show skill tree if points available
            if (skillPoints > 0) {
                this.showSkillTree();
            }
        });
        
        this.events.on('playerDied', () => {
            this.onGameOver();
        });
        
        // Enemy events
        this.events.on('enemyDamaged', (enemy, damage, source) => {
            // Visual feedback already handled in Enemy class
        });
        
        this.events.on('enemyDied', (enemy, xp) => {
            this.enemiesKilled++;
            this.score += xp * 10;
            
            // Update wave system
            this.waveSystem.enemiesRemaining--;
            
            if (this.waveSystem.enemiesRemaining <= 0 && this.waveSystem.isActive) {
                this.waveSystem.waveComplete();
            }
        });
    }
    
    spawnWave(waveNumber) {
        this.wave = waveNumber;
        
        // Show wave message
        this.showWaveMessage(`Wave ${waveNumber}`);
        
        // Determine enemies to spawn
        const enemyCount = this.calculateEnemyCount(waveNumber);
        const enemyTypes = this.getEnemyTypesForWave(waveNumber);
        
        // Spawn enemies
        for (let i = 0; i < enemyCount; i++) {
            const type = this.getRandomEnemyType(enemyTypes);
            const x = Phaser.Math.Between(100, 700);
            const y = Phaser.Math.Between(100, 300);
            
            const enemy = new Enemy(this, x, y, type, waveNumber);
            this.enemies.add(enemy);
        }
        
        // Update wave system
        this.waveSystem.isActive = true;
        this.waveSystem.enemiesRemaining = enemyCount;
        
        // Update UI
        document.getElementById('currentWave').textContent = waveNumber;
        this.logMessage(`Wave ${waveNumber} started! ${enemyCount} enemies approaching!`);
    }
    
    calculateEnemyCount(waveNumber) {
        const isBossWave = waveNumber % 5 === 0;
        return isBossWave ? 1 : 3 + Math.floor(waveNumber * 1.5);
    }
    
    getEnemyTypesForWave(waveNumber) {
        const types = [];
        
        if (waveNumber >= 1) types.push(CONSTANTS.ENEMY_TYPES.GOBLIN);
        if (waveNumber >= 2) types.push(CONSTANTS.ENEMY_TYPES.BRUTE);
        if (waveNumber >= 3) types.push(CONSTANTS.ENEMY_TYPES.ARCHER);
        if (waveNumber >= 4) types.push(CONSTANTS.ENEMY_TYPES.SHAMAN);
        
        return types;
    }
    
    getRandomEnemyType(availableTypes) {
        if (this.wave % 5 === 0) {
            return CONSTANTS.ENEMY_TYPES.BOSS;
        }
        
        const weights = {
            [CONSTANTS.ENEMY_TYPES.GOBLIN]: 50,
            [CONSTANTS.ENEMY_TYPES.BRUTE]: 30,
            [CONSTANTS.ENEMY_TYPES.ARCHER]: 15,
            [CONSTANTS.ENEMY_TYPES.SHAMAN]: 5
        };
        
        let totalWeight = 0;
        availableTypes.forEach(type => {
            totalWeight += weights[type] || 0;
        });
        
        let random = Math.random() * totalWeight;
        let weightSum = 0;
        
        for (const type of availableTypes) {
            weightSum += weights[type] || 0;
            if (random <= weightSum) {
                return type;
            }
        }
        
        return CONSTANTS.ENEMY_TYPES.GOBLIN;
    }
    
    startWave(waveNumber) {
        // Delay before spawning enemies
        this.time.delayedCall(1000, () => {
            this.spawnWave(waveNumber);
        });
    }
    
    onWaveComplete() {
        this.waveSystem.isActive = false;
        
        // Show wave complete message
        this.showWaveMessage(`Wave ${this.wave} Complete!`);
        
        // Increment wave
        this.wave++;
        
        // Save game
        this.saveGame();
        
        // Start next wave after delay
        this.time.delayedCall(3000, () => {
            this.startWave(this.wave);
        });
    }
    
    onPlayerHitByProjectile(player, projectile) {
        if (!projectile.isEnemyProjectile) return;
        
        // Damage player
        const died = player.takeDamage(projectile.damage || 1);
        
        // Destroy projectile
        projectile.destroy();
        
        if (died) {
            this.onGameOver();
        }
    }
    
    switchTarget() {
        const enemies = this.enemies.getChildren();
        if (enemies.length === 0) return;
        
        if (!this.currentTarget || !this.currentTarget.active) {
            this.currentTarget = enemies[0];
        } else {
            const currentIndex = enemies.indexOf(this.currentTarget);
            const nextIndex = (currentIndex + 1) % enemies.length;
            this.currentTarget = enemies[nextIndex];
        }
        
        if (this.currentTarget) {
            this.logMessage(`Target switched to ${this.currentTarget.data.name}`);
            
            // Visual feedback for target
            this.currentTarget.setTint(0xffff00);
            this.time.delayedCall(500, () => {
                if (this.currentTarget && this.currentTarget.active) {
                    this.currentTarget.clearTint();
                }
            });
        }
    }
    
    togglePause() {
        if (this.state === CONSTANTS.STATES.GAME_OVER) return;
        
        if (this.state === CONSTANTS.STATES.PLAYING) {
            this.state = CONSTANTS.STATES.PAUSED;
            this.physics.pause();
            this.spellSystem.activeCooldowns.forEach(cooldown => cooldown.paused = true);
            document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.state = CONSTANTS.STATES.PLAYING;
            this.physics.resume();
            this.spellSystem.activeCooldowns.forEach(cooldown => cooldown.paused = false);
            document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        }
    }
    
    updateHealthBar(currentHp, maxHp) {
        const percent = (currentHp / maxHp) * 100;
        document.getElementById('healthFill').style.width = `${percent}%`;
        document.getElementById('playerHealth').textContent = 
            `${Math.round(percent)}% (${currentHp}/${maxHp})`;
    }
    
    updateXPBar(xp, xpToNext) {
        const percent = (xp / xpToNext) * 100;
        document.getElementById('xpFill').style.width = `${percent}%`;
        document.getElementById('playerXP').textContent = 
            `Level ${this.player.data.level} | ${xp}/${xpToNext} XP`;
    }
    
    updateSkillPoints(points) {
        document.getElementById('skillPoints').textContent = points;
    }
    
    logMessage(message) {
        const log = document.getElementById('battleLog');
        const entry = document.createElement('div');
        entry.textContent = `[${this.getTimeStamp()}] ${message}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }
    
    getTimeStamp() {
        const now = new Date();
        return `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    }
    
    showWaveMessage(text) {
        const waveDisplay = document.getElementById('waveMessage');
        const waveText = waveDisplay.querySelector('.wave-text');
        
        waveText.textContent = text;
        waveDisplay.style.display = 'block';
        
        // Hide after animation
        setTimeout(() => {
            waveDisplay.style.display = 'none';
        }, 2000);
    }
    
    showSkillTree() {
        document.getElementById('skillTreeModal').classList.add('active');
        
        // Populate spell options
        this.populateSpellOptions();
    }
    
    populateSpellOptions() {
        const container = document.getElementById('spellOptions');
        const availableSkillPoints = document.getElementById('availableSkillPoints');
        
        availableSkillPoints.textContent = this.player.data.skillPoints;
        
        // Get available spells to unlock
        const allSpells = [
            {
                id: CONSTANTS.SPELLS.PLASMA_ORB,
                name: "Plasma Orb",
                description: "Powerful arcane energy with splash damage",
                damage: 2,
                cooldown: "2s",
                unlockLevel: 3,
                icon: "fas fa-bolt"
            },
            {
                id: CONSTANTS.SPELLS.HEALING_LIGHT,
                name: "Healing Light",
                description: "Restores your health",
                damage: -2,
                cooldown: "3s",
                unlockLevel: 5,
                icon: "fas fa-heart"
            }
        ];
        
        const availableSpells = allSpells.filter(spell => 
            !this.player.data.spellsUnlocked.includes(spell.id) && 
            spell.unlockLevel <= this.player.data.level
        );
        
        if (availableSpells.length === 0) {
            container.innerHTML = '<p>No new spells available to unlock yet!</p>';
            return;
        }
        
        container.innerHTML = availableSpells.map(spell => `
            <div class="spell-option" data-spell-id="${spell.id}">
                <h3><i class="${spell.icon}"></i> ${spell.name}</h3>
                <p>${spell.description}</p>
                <p>${spell.damage > 0 ? `Damage: ${spell.damage}` : `Heal: ${-spell.damage}`}</p>
                <p>Cooldown: ${spell.cooldown}</p>
                <button class="btn-small unlock-spell-btn" data-spell-id="${spell.id}">
                    Unlock (1 Skill Point)
                </button>
            </div>
        `).join('');
        
        // Bind unlock buttons
        document.querySelectorAll('.unlock-spell-btn').forEach(button => {
            button.onclick = (e) => {
                const spellId = parseInt(e.target.dataset.spellId);
                this.unlockSpell(spellId);
            };
        });
    }
    
    unlockSpell(spellId) {
        if (this.player.data.skillPoints < 1) return;
        
        this.player.data.spellsUnlocked.push(spellId);
        this.player.data.skillPoints--;
        
        // Update spell system
        this.spellSystem.init(this.player);
        
        // Update UI
        this.updateSkillPoints(this.player.data.skillPoints);
        
        // Close modal if no points left
        if (this.player.data.skillPoints < 1) {
            document.getElementById('skillTreeModal').classList.remove('active');
        } else {
            this.populateSpellOptions();
        }
        
        this.logMessage(`Unlocked new spell!`);
    }
    
    saveGame() {
        const saveData = {
            version: 3,
            player: {
                hp: this.player.data.hp,
                maxHp: this.player.data.maxHp,
                xp: this.player.data.xp,
                level: this.player.data.level,
                xpToNext: this.player.data.xpToNext,
                skillPoints: this.player.data.skillPoints,
                spellsUnlocked: [...this.player.data.spellsUnlocked],
                damageBonus: this.player.data.damageBonus
            },
            game: {
                wave: this.wave,
                zoneIndex: this.zoneIndex,
                score: this.score,
                enemiesKilled: this.enemiesKilled
            },
            timestamp: Date.now()
        };
        
        // Update global stats
        if (this.wave > GAME_DATA.player.highestWave) {
            GAME_DATA.player.highestWave = this.wave;
        }
        
        GAME_DATA.player.spellsUnlocked = Math.max(
            GAME_DATA.player.spellsUnlocked,
            saveData.player.spellsUnlocked.length
        );
        
        // Save to localStorage
        localStorage.setItem(CONSTANTS.SAVE_KEY, JSON.stringify(saveData));
        
        // Also save settings
        localStorage.setItem('gg_settings_v3', JSON.stringify(GAME_DATA.settings));
        
        this.logMessage('Game saved.');
    }
    
    onGameOver() {
        this.state = CONSTANTS.STATES.GAME_OVER;
        
        // Update defeat stats
        document.getElementById('defeatWave').textContent = this.wave - 1;
        document.getElementById('defeatLevel').textContent = this.player.data.level;
        document.getElementById('defeatSpells').textContent = this.player.data.spellsUnlocked.length;
        
        // Show game over modal after delay
        this.time.delayedCall(1000, () => {
            this.hideGameUI();
            document.getElementById('gameOverModal').classList.add('active');
        });
        
        // Bind game over buttons
        document.getElementById('restartBtn').onclick = () => {
            document.getElementById('gameOverModal').classList.remove('active');
            this.scene.restart({ newGame: true });
        };
        
        document.getElementById('menuBtn').onclick = () => {
            document.getElementById('gameOverModal').classList.remove('active');
            this.scene.start('MainMenuScene');
        };
    }
    
    showGameUI() {
        document.getElementById('gameUI').classList.add('active');
    }
    
    hideGameUI() {
        document.getElementById('gameUI').classList.remove('active');
    }
    
    update(time, delta) {
        if (this.state !== CONSTANTS.STATES.PLAYING) return;
        
        // Update spell system
        if (this.spellSystem) {
            this.spellSystem.update(time, delta);
        }
        
        // Update player
        if (this.player) {
            this.player.update(time, delta);
        }
    }
}