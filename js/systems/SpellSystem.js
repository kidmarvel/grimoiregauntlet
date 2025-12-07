class SpellSystem {
    constructor(scene) {
        this.scene = scene;
        this.spells = [];
        this.projectiles = scene.physics.add.group();
        this.activeCooldowns = new Map();
    }
    
    init(player) {
        this.player = player;
        this.spells = player.getSpellData();
        
        // Set up keyboard input for spells
        this.setupInput();
        
        // Update UI
        this.updateSpellUI();
    }
    
    setupInput() {
        // Number keys 1-4
        this.scene.input.keyboard.on('keydown-ONE', () => this.castSpell(0));
        this.scene.input.keyboard.on('keydown-TWO', () => this.castSpell(1));
        this.scene.input.keyboard.on('keydown-THREE', () => this.castSpell(2));
        this.scene.input.keyboard.on('keydown-FOUR', () => this.castSpell(3));
        
        // Also bind to UI buttons
        document.querySelectorAll('.spell-slot').forEach((slot, index) => {
            slot.onclick = () => this.castSpell(index);
        });
    }
    
    castSpell(index) {
        if (index >= this.spells.length) return;
        
        const spell = this.spells[index];
        
        // Check cooldown
        if (this.activeCooldowns.has(index)) return;
        if (!spell.ready) return;
        
        // Get target
        const target = this.scene.currentTarget;
        if (!target && spell.id !== CONSTANTS.SPELLS.HEALING_LIGHT) return;
        
        // Play sound
        this.playSpellSound(spell);
        
        // Create spell effect
        this.createSpellEffect(spell, target);
        
        // Start cooldown
        this.startCooldown(index, spell.cooldown);
        
        // Update UI
        this.updateSpellUI();
    }
    
    playSpellSound(spell) {
        switch(spell.id) {
            case CONSTANTS.SPELLS.FIREBOLT:
                AUDIO_SYSTEM.playSfx('sfx_fire_cast');
                break;
            case CONSTANTS.SPELLS.FROST_RAY:
                AUDIO_SYSTEM.playSfx('sfx_ice_cast');
                break;
            case CONSTANTS.SPELLS.PLASMA_ORB:
                AUDIO_SYSTEM.playSfx('sfx_thunder_cast');
                break;
            case CONSTANTS.SPELLS.HEALING_LIGHT:
                AUDIO_SYSTEM.playSfx('sfx_heal_cast');
                break;
        }
    }
    
    createSpellEffect(spell, target) {
        switch(spell.id) {
            case CONSTANTS.SPELLS.FIREBOLT:
            case CONSTANTS.SPELLS.FROST_RAY:
            case CONSTANTS.SPELLS.PLASMA_ORB:
                this.createProjectile(spell, target);
                break;
            case CONSTANTS.SPELLS.HEALING_LIGHT:
                this.createHealEffect(spell);
                break;
        }
    }
    
    createProjectile(spell, target) {
        const projectile = this.scene.physics.add.sprite(
            this.player.x,
            this.player.y,
            spell.texture
        );
        
        projectile.spellData = spell;
        projectile.target = target;
        
        // Visual setup
        projectile.setScale(0.8);
        projectile.setTint(Phaser.Display.Color.GetColor(
            parseInt(spell.color.substr(1, 2), 16),
            parseInt(spell.color.substr(3, 2), 16),
            parseInt(spell.color.substr(5, 2), 16)
        ));
        
        // Add glow effect
        projectile.setAlpha(0.9);
        this.scene.tweens.add({
            targets: projectile,
            alpha: 1,
            duration: 100,
            yoyo: true,
            repeat: -1
        });
        
        // Add to projectiles group
        this.projectiles.add(projectile);
        
        // Homing behavior
        this.scene.time.addEvent({
            delay: 16,
            callback: () => this.updateProjectile(projectile),
            callbackScope: this,
            loop: true
        });
    }
    
    updateProjectile(projectile) {
        if (!projectile.active) return;
        
        const spell = projectile.spellData;
        const target = projectile.target;
        
        if (!target || !target.active) {
            projectile.destroy();
            return;
        }
        
        // Move toward target
        const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, target.x, target.y);
        const speed = 300; // pixels per second
        
        projectile.body.velocity.x = Math.cos(angle) * speed;
        projectile.body.velocity.y = Math.sin(angle) * speed;
        
        // Check collision
        const distance = Phaser.Math.Distance.Between(projectile.x, projectile.y, target.x, target.y);
        
        if (distance < target.body.radius + projectile.width / 2) {
            this.hitTarget(projectile, target);
        }
    }
    
    hitTarget(projectile, target) {
        const spell = projectile.spellData;
        
        // Apply damage
        if (spell.damage > 0) {
            const killed = target.takeDamage(spell.damage, 'spell');
            
            if (killed && target.data) {
                this.player.addXP(target.data.xpValue);
            }
        }
        
        // Apply effects
        if (spell.effect === "slow") {
            target.applySlow(2000); // 2 seconds slow
        } else if (spell.effect === "splash") {
            // Splash damage to nearby enemies
            this.scene.enemies.getChildren().forEach(enemy => {
                if (enemy !== target && enemy.active) {
                    const distance = Phaser.Math.Distance.Between(
                        target.x, target.y,
                        enemy.x, enemy.y
                    );
                    
                    if (distance < 100) {
                        enemy.takeDamage(spell.damage * 0.5, 'splash');
                    }
                }
            });
        }
        
        // Create hit effect
        this.createHitEffect(projectile.x, projectile.y, spell.color);
        
        // Destroy projectile
        projectile.destroy();
    }
    
    createHitEffect(x, y, color) {
        const particles = this.scene.add.particles('particle_fire');
        
        particles.createEmitter({
            x: x,
            y: y,
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 800,
            quantity: 15
        });
    }
    
    createHealEffect(spell) {
        // Heal player
        this.player.heal(-spell.damage); // Negative damage = healing
        
        // Healing particles
        const particles = this.scene.add.particles('particle_heal');
        
        particles.createEmitter({
            x: this.player.x,
            y: this.player.y,
            speed: { min: 50, max: 100 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1000,
            quantity: 20
        });
        
        // Healing animation
        this.scene.tweens.add({
            targets: this.player,
            alpha: 0.7,
            duration: 200,
            yoyo: true,
            repeat: 2
        });
    }
    
    startCooldown(index, duration) {
        this.spells[index].ready = false;
        
        this.activeCooldowns.set(index, this.scene.time.delayedCall(duration, () => {
            this.spells[index].ready = true;
            this.activeCooldowns.delete(index);
            this.updateSpellUI();
        }));
    }
    
    updateSpellUI() {
        const container = document.getElementById('spellHotkeys');
        if (!container) return;
        
        container.innerHTML = this.spells.map((spell, i) => {
            const isReady = spell.ready && !this.activeCooldowns.has(i);
            const cooldownPercent = this.activeCooldowns.has(i) ? 100 : 0;
            
            return `
                <div class="spell-slot" data-key="${i + 1}">
                    <span class="key">${i + 1}</span>
                    <span class="name">${spell.name}</span>
                    ${!isReady ? `
                        <div class="cooldown-overlay" 
                             style="height:${cooldownPercent}%">
                        </div>` : ''}
                </div>
            `;
        }).join('');
        
        // Rebind click events
        document.querySelectorAll('.spell-slot').forEach((slot, i) => {
            slot.onclick = () => this.castSpell(i);
        });
    }
    
    update(time, delta) {
        // Update projectiles
        this.projectiles.getChildren().forEach(projectile => {
            if (!projectile.active) return;
            
            // Remove if off screen
            if (projectile.x < -50 || projectile.x > this.scene.physics.world.bounds.width + 50 ||
                projectile.y < -50 || projectile.y > this.scene.physics.world.bounds.height + 50) {
                projectile.destroy();
            }
        });
    }
}

// Make available globally
window.SpellSystem = SpellSystem;