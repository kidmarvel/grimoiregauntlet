class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type, waveNumber) {
        const texture = `enemy_${type}`;
        super(scene, x, y, texture);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Enemy data based on type
        this.type = type;
        this.initData(type, waveNumber);
        
        // Setup based on type
        this.setupEnemy(type);
        
        // State
        this.isAlive = true;
        this.currentTarget = null;
        this.attackCooldown = 0;
        this.slowTimer = 0;
        
        // Play idle animation
        this.play(`${type}_idle`);
        
        // Add to enemy group
        if (scene.enemies) {
            scene.enemies.add(this);
        }
    }
    
    initData(type, waveNumber) {
        const baseStats = this.getBaseStats(type);
        const healthMultiplier = 1 + (waveNumber * 0.1);
        const xpMultiplier = 1 + (waveNumber * 0.05);
        
        this.data = {
            name: baseStats.name,
            maxHp: Math.floor(baseStats.health * healthMultiplier),
            hp: Math.floor(baseStats.health * healthMultiplier),
            attack: baseStats.attack,
            speed: baseStats.speed,
            xpValue: Math.floor(baseStats.xp * xpMultiplier),
            attackRange: baseStats.attackRange || 0,
            projectileSpeed: baseStats.projectileSpeed || 0,
            attackCooldownTime: baseStats.attackCooldown || 60,
            behavior: baseStats.behavior,
            special: baseStats.special
        };
    }
    
    getBaseStats(type) {
        switch(type) {
            case CONSTANTS.ENEMY_TYPES.GOBLIN:
                return {
                    name: "Goblin",
                    health: 3,
                    attack: 1,
                    speed: 80,
                    xp: 2,
                    behavior: "melee"
                };
            case CONSTANTS.ENEMY_TYPES.BRUTE:
                return {
                    name: "Goblin Brute",
                    health: 6,
                    attack: 2,
                    speed: 50,
                    xp: 4,
                    behavior: "melee"
                };
            case CONSTANTS.ENEMY_TYPES.ARCHER:
                return {
                    name: "Goblin Archer",
                    health: 2,
                    attack: 1,
                    speed: 100,
                    xp: 3,
                    behavior: "ranged",
                    attackRange: 200,
                    projectileSpeed: 300,
                    attackCooldown: 2000
                };
            case CONSTANTS.ENEMY_TYPES.SHAMAN:
                return {
                    name: "Goblin Shaman",
                    health: 4,
                    attack: 1,
                    speed: 70,
                    xp: 5,
                    behavior: "ranged",
                    attackRange: 250,
                    projectileSpeed: 250,
                    attackCooldown: 3000,
                    special: "heal"
                };
            case CONSTANTS.ENEMY_TYPES.BOSS:
                return {
                    name: "Goblin King",
                    health: 30,
                    attack: 3,
                    speed: 40,
                    xp: 20,
                    behavior: "ranged",
                    attackRange: 400,
                    projectileSpeed: 200,
                    attackCooldown: 4000,
                    special: "summon"
                };
        }
    }
    
    setupEnemy(type) {
        // Set collision body
        const size = this.getSize(type);
        this.setCircle(size / 2);
        this.setBounce(0.2);
        this.setDrag(300);
        this.setMaxVelocity(this.data.speed);
        
        // Set tint based on type
        this.setTint(this.getColor(type));
    }
    
    getSize(type) {
        switch(type) {
            case CONSTANTS.ENEMY_TYPES.GOBLIN: return 40;
            case CONSTANTS.ENEMY_TYPES.BRUTE: return 50;
            case CONSTANTS.ENEMY_TYPES.ARCHER: return 36;
            case CONSTANTS.ENEMY_TYPES.SHAMAN: return 44;
            case CONSTANTS.ENEMY_TYPES.BOSS: return 80;
            default: return 40;
        }
    }
    
    getColor(type) {
        switch(type) {
            case CONSTANTS.ENEMY_TYPES.GOBLIN: return 0x00fc08;
            case CONSTANTS.ENEMY_TYPES.BRUTE: return 0x000087;
            case CONSTANTS.ENEMY_TYPES.ARCHER: return 0xfc3b00;
            case CONSTANTS.ENEMY_TYPES.SHAMAN: return 0x00bbff;
            case CONSTANTS.ENEMY_TYPES.BOSS: return 0xD32F2F;
            default: return 0xffffff;
        }
    }
    
    update(time, delta) {
        if (!this.isAlive) return;
        
        // Update cooldowns
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }
        
        // Update slow effect
        if (this.slowTimer > 0) {
            this.slowTimer -= delta;
            this.setMaxVelocity(this.data.speed * 0.5);
        } else {
            this.setMaxVelocity(this.data.speed);
        }
        
        // Behavior
        if (this.data.behavior === "melee") {
            this.meleeBehavior(delta);
        } else if (this.data.behavior === "ranged") {
            this.rangedBehavior(delta);
        }
        
        // Update animation based on movement
        if (this.body.speed > 0) {
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== `${this.type}_walk`) {
                this.play(`${this.type}_walk`, true);
            }
        } else {
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== `${this.type}_idle`) {
                this.play(`${this.type}_idle`, true);
            }
        }
    }
    
    meleeBehavior(delta) {
        const player = this.scene.player;
        if (!player || !player.active) return;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        if (distance > 50) {
            // Move toward player
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.setVelocity(
                Math.cos(angle) * this.data.speed,
                Math.sin(angle) * this.data.speed
            );
        } else if (this.attackCooldown <= 0) {
            // Attack player
            this.attackCooldown = this.data.attackCooldownTime;
            this.scene.events.emit('enemyAttack', this, player);
            
            // Attack animation
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 200,
                yoyo: true
            });
        }
    }
    
    rangedBehavior(delta) {
        const player = this.scene.player;
        if (!player || !player.active) return;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        if (distance <= this.data.attackRange) {
            // Keep distance
            if (distance < this.data.attackRange * 0.7) {
                const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
                this.setVelocity(
                    Math.cos(angle) * -this.data.speed * 0.5,
                    Math.sin(angle) * -this.data.speed * 0.5
                );
            } else {
                this.setVelocity(0, 0);
            }
            
            // Shoot if cooldown is ready
            if (this.attackCooldown <= 0 && distance < this.data.attackRange) {
                this.shootAtPlayer();
            }
        } else {
            // Move toward player to get in range
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.setVelocity(
                Math.cos(angle) * this.data.speed,
                Math.sin(angle) * this.data.speed
            );
        }
    }
    
    shootAtPlayer() {
        this.attackCooldown = this.data.attackCooldownTime;
        
        // Create projectile
        const projectile = this.scene.physics.add.sprite(
            this.x,
            this.y,
            'projectile_fire'
        );
        
        projectile.setScale(0.5);
        projectile.setTint(0xff0000);
        projectile.damage = this.data.attack;
        projectile.isEnemyProjectile = true;
        
        // Calculate direction to player
        const angle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
        
        this.scene.physics.velocityFromRotation(
            angle,
            this.data.projectileSpeed,
            projectile.body.velocity
        );
        
        // Add to projectiles group
        if (this.scene.enemyProjectiles) {
            this.scene.enemyProjectiles.add(projectile);
        }
        
        // Attack animation
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 150,
            yoyo: true
        });
    }
    
    takeDamage(amount, source) {
        if (!this.isAlive) return;
        
        this.data.hp -= amount;
        
        // Visual feedback
        this.setTint(0xffffff);
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true
        });
        
        // Hit particles
        const particles = this.scene.add.particles('particle_hit');
        particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 20, max: 50 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 5
        });
        
        // Sound
        AUDIO_SYSTEM.playSfx('enemy_hit');
        
        // Emit event
        this.scene.events.emit('enemyDamaged', this, amount, source);
        
        // Check if dead
        if (this.data.hp <= 0) {
            this.die();
            return true;
        }
        
        return false;
    }
    
    applySlow(duration) {
        this.slowTimer = duration;
        this.setTint(0x66ccff); // Blue tint for slow
    }
    
    die() {
        this.isAlive = false;
        
        // Death animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 300,
            onComplete: () => {
                this.destroy();
            }
        });
        
        // Death particles
        const particles = this.scene.add.particles('particle_hit');
        particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 50, max: 100 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            quantity: 10
        });
        
        // Emit death event
        this.scene.events.emit('enemyDied', this, this.data.xpValue);
    }
}

// Make available globally
window.Enemy = Enemy;