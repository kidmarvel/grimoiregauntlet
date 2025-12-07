class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player_idle');
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Player data (from your original game)
        this.data = {
            hp: CONSTANTS.PLAYER_MAX_HP,
            maxHp: CONSTANTS.PLAYER_MAX_HP,
            xp: 0,
            level: 1,
            xpToNext: 10,
            skillPoints: 0,
            damageBonus: 0,
            spellsUnlocked: [CONSTANTS.SPELLS.FIREBOLT, CONSTANTS.SPELLS.FROST_RAY],
            invulnerable: false,
            lastDamaged: 0
        };
        
        // Physics setup
        this.setCollideWorldBounds(true);
        this.setCircle(CONSTANTS.PLAYER_SIZE);
        this.setBounce(0.2);
        this.setDrag(500);
        this.setMaxVelocity(CONSTANTS.PLAYER_SPEED);
        
        // Visual setup
        this.setDepth(10);
        this.play('player_idle');
        
        // Target position for movement
        this.targetX = x;
        this.targetY = y;
        
        // Input
        this.setupInput(scene);
    }
    
    setupInput(scene) {
        // Mouse movement
        scene.input.on('pointermove', (pointer) => {
            this.targetX = Phaser.Math.Clamp(pointer.worldX, 0, scene.physics.world.bounds.width);
            this.targetY = Phaser.Math.Clamp(pointer.worldY, 0, scene.physics.world.bounds.height);
        });
        
        // Right click to interact (can be used for targeting)
        scene.input.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) {
                scene.events.emit('playerRightClick', pointer.worldX, pointer.worldY);
            }
        });
    }
    
    update(time, delta) {
        // Update invulnerability
        if (this.data.invulnerable) {
            this.data.lastDamaged += delta;
            if (this.data.lastDamaged >= CONSTANTS.PLAYER_INVULNERABILITY_TIME) {
                this.data.invulnerable = false;
                this.clearTint();
            } else {
                // Flash effect
                this.setTintFill(0xffffff * Math.random());
            }
        }
        
        // Movement towards target
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
        
        if (distance > 10) {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetX, this.targetY);
            this.setVelocity(
                Math.cos(angle) * CONSTANTS.PLAYER_SPEED,
                Math.sin(angle) * CONSTANTS.PLAYER_SPEED
            );
            
            // Play run animation
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'player_run') {
                this.play('player_run', true);
            }
        } else {
            this.setVelocity(0, 0);
            
            // Play idle animation
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'player_idle') {
                this.play('player_idle', true);
            }
        }
    }
    
    takeDamage(amount) {
        if (this.data.invulnerable) return false;
        
        this.data.hp -= amount;
        this.data.invulnerable = true;
        this.data.lastDamaged = 0;
        
        // Visual feedback
        this.scene.cameras.main.shake(100, 0.01);
        this.setTint(0xff0000);
        
        // Sound
        AUDIO_SYSTEM.playSfx('player_hit');
        
        // Emit event
        this.scene.events.emit('playerDamaged', this.data.hp, this.data.maxHp);
        
        // Check for death
        if (this.data.hp <= 0) {
            this.die();
            return true;
        }
        
        return false;
    }
    
    heal(amount) {
        this.data.hp = Phaser.Math.Clamp(this.data.hp + amount, 0, this.data.maxHp);
        this.scene.events.emit('playerHealed', this.data.hp, this.data.maxHp);
        
        // Healing effect
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    addXP(amount) {
        this.data.xp += amount;
        
        // Check for level up
        while (this.data.xp >= this.data.xpToNext) {
            this.levelUp();
        }
        
        this.scene.events.emit('xpGained', this.data.xp, this.data.xpToNext);
    }
    
    levelUp() {
        this.data.xp -= this.data.xpToNext;
        this.data.level++;
        this.data.skillPoints++;
        this.data.maxHp++;
        this.data.hp = this.data.maxHp;
        this.data.xpToNext = this.calculateXPToNext();
        
        // Effects
        AUDIO_SYSTEM.playSfx('level_up');
        
        // Level up particles
        const particles = this.scene.add.particles('particle_heal');
        particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 100 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            quantity: 20
        });
        
        this.scene.events.emit('playerLevelUp', this.data.level, this.data.skillPoints);
    }
    
    calculateXPToNext() {
        return 10 + this.data.level * 5;
    }
    
    die() {
        this.setActive(false);
        this.setVisible(false);
        this.scene.events.emit('playerDied');
    }
    
    getSpellData() {
        return this.data.spellsUnlocked.map(id => {
            switch (id) {
                case CONSTANTS.SPELLS.FIREBOLT:
                    return {
                        id: id,
                        name: "Firebolt",
                        color: COLORS.SPELL_FIRE,
                        cooldown: 1000,
                        damage: 1 + this.data.damageBonus,
                        ready: true,
                        cooldownTimer: 0,
                        texture: 'projectile_fire'
                    };
                case CONSTANTS.SPELLS.FROST_RAY:
                    return {
                        id: id,
                        name: "Frost Ray",
                        color: COLORS.SPELL_ICE,
                        cooldown: 1500,
                        damage: 1 + this.data.damageBonus,
                        ready: true,
                        cooldownTimer: 0,
                        texture: 'projectile_ice',
                        effect: "slow"
                    };
                case CONSTANTS.SPELLS.PLASMA_ORB:
                    return {
                        id: id,
                        name: "Plasma Orb",
                        color: COLORS.SPELL_PLASMA,
                        cooldown: 2000,
                        damage: 2 + this.data.damageBonus,
                        ready: true,
                        cooldownTimer: 0,
                        texture: 'projectile_plasma',
                        effect: "splash"
                    };
                case CONSTANTS.SPELLS.HEALING_LIGHT:
                    return {
                        id: id,
                        name: "Healing Light",
                        color: COLORS.SPELL_HEAL,
                        cooldown: 3000,
                        damage: -2,
                        ready: true,
                        cooldownTimer: 0,
                        texture: 'projectile_heal'
                    };
            }
        });
    }
}

// Make available globally
window.Player = Player;