// Projectile entity for Grimoire Gauntlet
class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, config = {}) {
        super(scene, x, y, texture);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Projectile data
        this.config = {
            speed: 300,
            damage: 1,
            lifespan: 5000, // ms
            isEnemy: false,
            homing: false,
            target: null,
            onHit: null,
            ...config
        };
        
        // Physics setup
        this.setCollideWorldBounds(true);
        this.setBounce(0.5);
        
        if (this.config.size) {
            this.setCircle(this.config.size / 2);
        }
        
        // Visual setup
        if (this.config.color) {
            this.setTint(this.config.color);
        }
        
        if (this.config.scale) {
            this.setScale(this.config.scale);
        }
        
        // Start lifespan timer
        this.lifespanTimer = scene.time.delayedCall(
            this.config.lifespan,
            () => this.destroy(),
            [],
            this
        );
        
        // Set initial velocity if provided
        if (this.config.velocity) {
            this.setVelocity(this.config.velocity.x, this.config.velocity.y);
        } else if (this.config.angle !== undefined) {
            // Set velocity based on angle
            scene.physics.velocityFromRotation(
                this.config.angle,
                this.config.speed,
                this.body.velocity
            );
        }
        
        // Add glow effect for player projectiles
        if (!this.config.isEnemy) {
            this.setAlpha(0.9);
            scene.tweens.add({
                targets: this,
                alpha: 1,
                duration: 100,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    update(time, delta) {
        // Homing behavior
        if (this.config.homing && this.config.target && this.config.target.active) {
            this.homeToTarget(delta);
        }
        
        // Rotate based on velocity
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            this.rotation = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        }
        
        // Fade out near end of lifespan
        const remaining = this.lifespanTimer.getRemaining();
        if (remaining < 1000) {
            this.setAlpha(remaining / 1000);
        }
    }
    
    homeToTarget(delta) {
        const target = this.config.target;
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
        const currentSpeed = Math.sqrt(
            this.body.velocity.x * this.body.velocity.x + 
            this.body.velocity.y * this.body.velocity.y
        );
        
        // Gradually turn toward target
        const turnRate = 0.1;
        const currentAngle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        const angleDiff = Phaser.Math.Angle.Wrap(angle - currentAngle);
        
        const newAngle = currentAngle + angleDiff * turnRate;
        
        this.scene.physics.velocityFromRotation(
            newAngle,
            currentSpeed,
            this.body.velocity
        );
    }
    
    hit(target) {
        // Apply damage if target has takeDamage method
        if (target.takeDamage && typeof target.takeDamage === 'function') {
            const killed = target.takeDamage(this.config.damage, 'projectile');
            
            // Call custom onHit callback
            if (this.config.onHit) {
                this.config.onHit(target, killed);
            }
            
            // Create hit effect
            this.createHitEffect();
            
            // Destroy projectile
            this.destroy();
            
            return killed;
        }
        
        return false;
    }
    
    createHitEffect() {
        // Create particles at impact point
        const particles = this.scene.add.particles(
            this.config.isEnemy ? 'particle_hit' : 'particle_fire'
        );
        
        particles.createEmitter({
            x: this.x,
            y: this.y,
            speed: { min: 30, max: 80 },
            scale: { start: 0.8, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 600,
            quantity: 8
        });
        
        // Play hit sound
        if (window.AUDIO_SYSTEM) {
            if (this.config.isEnemy) {
                window.AUDIO_SYSTEM.playSfxAt('sfx_player_hit', this.x, this.y, { volume: 0.3 });
            } else {
                window.AUDIO_SYSTEM.playSfxAt('sfx_enemy_hit', this.x, this.y, { volume: 0.3 });
            }
        }
    }
    
    destroy(fromScene) {
        // Clean up timer
        if (this.lifespanTimer) {
            this.lifespanTimer.remove();
        }
        
        super.destroy(fromScene);
    }
    
    // Static factory methods for different projectile types
    static createFirebolt(scene, x, y, target, damage) {
        return new Projectile(scene, x, y, 'projectile_fire', {
            damage: damage,
            homing: true,
            target: target,
            speed: 400,
            color: 0xff4422,
            scale: 0.6,
            lifespan: 3000
        });
    }
    
    static createFrostRay(scene, x, y, target, damage) {
        return new Projectile(scene, x, y, 'projectile_ice', {
            damage: damage,
            homing: true,
            target: target,
            speed: 350,
            color: 0x66ccff,
            scale: 0.5,
            lifespan: 4000,
            onHit: (target) => {
                if (target.applySlow) {
                    target.applySlow(2000); // 2 second slow
                }
            }
        });
    }
    
    static createPlasmaOrb(scene, x, y, target, damage) {
        return new Projectile(scene, x, y, 'projectile_plasma', {
            damage: damage,
            homing: true,
            target: target,
            speed: 300,
            color: 0xcc66ff,
            scale: 0.8,
            lifespan: 5000,
            onHit: (target, killed) => {
                // Splash damage
                const splashRadius = 80;
                const splashDamage = damage * 0.5;
                
                // Find nearby enemies
                const enemies = scene.enemies?.getChildren() || [];
                enemies.forEach(enemy => {
                    if (enemy !== target && enemy.active) {
                        const distance = Phaser.Math.Distance.Between(
                            target.x, target.y,
                            enemy.x, enemy.y
                        );
                        
                        if (distance < splashRadius) {
                            enemy.takeDamage(splashDamage, 'splash');
                        }
                    }
                });
            }
        });
    }
    
    static createEnemyProjectile(scene, x, y, angle, damage) {
        return new Projectile(scene, x, y, 'projectile_fire', {
            damage: damage,
            angle: angle,
            speed: 200,
            color: 0xff0000,
            scale: 0.4,
            isEnemy: true,
            lifespan: 4000
        });
    }
}

// Make globally available
window.Projectile = Projectile;