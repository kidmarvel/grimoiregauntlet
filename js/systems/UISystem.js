// UI System for Grimoire Gauntlet
class UISystem {
    constructor(gameScene) {
        this.scene = gameScene;
        this.elements = {};
        this.animations = {};
        
        this.init();
    }
    
    init() {
        // Cache DOM elements
        this.cacheElements();
        
        // Bind events
        this.bindEvents();
        
        // Initialize UI state
        this.updateAll();
    }
    
    cacheElements() {
        this.elements = {
            // Health
            healthFill: document.getElementById('healthFill'),
            healthText: document.getElementById('playerHealth'),
            
            // XP
            xpFill: document.getElementById('xpFill'),
            xpText: document.getElementById('playerXP'),
            
            // Resources
            skillPoints: document.getElementById('skillPoints'),
            currentWave: document.getElementById('currentWave'),
            zoneName: document.getElementById('zoneName'),
            
            // Log
            battleLog: document.getElementById('battleLog'),
            
            // Wave display
            waveMessage: document.getElementById('waveMessage'),
            waveText: document.querySelector('.wave-text'),
            
            // Spell hotkeys
            spellHotkeys: document.getElementById('spellHotkeys'),
            
            // Buttons
            pauseBtn: document.getElementById('pauseBtn'),
            clearLogBtn: document.getElementById('clearLogBtn')
        };
    }
    
    bindEvents() {
        // Pause button
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.onclick = () => {
                this.scene.togglePause();
            };
        }
        
        // Clear log button
        if (this.elements.clearLogBtn) {
            this.elements.clearLogBtn.onclick = () => {
                this.clearBattleLog();
            };
        }
        
        // Close modal buttons
        const closeButtons = document.querySelectorAll('.btn-close, .modal-close');
        closeButtons.forEach(btn => {
            btn.onclick = () => {
                const modal = btn.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            };
        });
    }
    
    updateHealth(currentHp, maxHp) {
        if (!this.elements.healthFill || !this.elements.healthText) return;
        
        const percent = (currentHp / maxHp) * 100;
        this.elements.healthFill.style.width = `${percent}%`;
        this.elements.healthText.textContent = `${Math.round(percent)}% (${currentHp}/${maxHp})`;
        
        // Color coding
        if (percent > 60) {
            this.elements.healthFill.style.background = 'linear-gradient(90deg, var(--danger), var(--danger-light))';
        } else if (percent > 30) {
            this.elements.healthFill.style.background = 'linear-gradient(90deg, #FFC107, #FFD54F)';
        } else {
            this.elements.healthFill.style.background = 'linear-gradient(90deg, #F44336, #EF5350)';
        }
    }
    
    updateXP(currentXP, xpToNext, level) {
        if (!this.elements.xpFill || !this.elements.xpText) return;
        
        const percent = (currentXP / xpToNext) * 100;
        this.elements.xpFill.style.width = `${percent}%`;
        this.elements.xpText.textContent = `Level ${level} | ${currentXP}/${xpToNext} XP`;
    }
    
    updateSkillPoints(points) {
        if (this.elements.skillPoints) {
            this.elements.skillPoints.textContent = points;
        }
    }
    
    updateWave(waveNumber) {
        if (this.elements.currentWave) {
            this.elements.currentWave.textContent = waveNumber;
        }
    }
    
    updateZone(zoneName) {
        if (this.elements.zoneName) {
            this.elements.zoneName.textContent = zoneName;
        }
    }
    
    showWaveMessage(text, duration = 2000) {
        if (!this.elements.waveMessage || !this.elements.waveText) return;
        
        this.elements.waveText.textContent = text;
        this.elements.waveMessage.style.display = 'block';
        
        // Animation
        this.elements.waveMessage.style.animation = 'none';
        setTimeout(() => {
            this.elements.waveMessage.style.animation = 'wavePop 2s forwards ease';
        }, 10);
        
        // Auto-hide
        setTimeout(() => {
            this.elements.waveMessage.style.display = 'none';
        }, duration);
    }
    
    logMessage(message, type = 'info') {
        if (!this.elements.battleLog) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        
        const timestamp = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        let icon = 'ℹ️';
        if (type === 'damage') icon = '⚔️';
        if (type === 'heal') icon = '💚';
        if (type === 'spell') icon = '✨';
        if (type === 'level') icon = '⭐';
        if (type === 'warning') icon = '⚠️';
        
        entry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-icon">${icon}</span>
            <span class="log-text">${message}</span>
        `;
        
        this.elements.battleLog.appendChild(entry);
        
        // Auto-scroll to bottom
        this.elements.battleLog.scrollTop = this.elements.battleLog.scrollHeight;
        
        // Auto-remove old entries if too many
        const entries = this.elements.battleLog.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
        
        // Fade out after some time
        setTimeout(() => {
            entry.style.opacity = '0.5';
        }, 10000);
    }
    
    clearBattleLog() {
        if (this.elements.battleLog) {
            this.elements.battleLog.innerHTML = '';
        }
    }
    
    updateSpellHotkeys(spells, activeCooldowns) {
        if (!this.elements.spellHotkeys) return;
        
        this.elements.spellHotkeys.innerHTML = spells.map((spell, index) => {
            const isReady = spell.ready && !activeCooldowns.has(index);
            const cooldown = activeCooldowns.get(index);
            const cooldownPercent = cooldown ? 
                (cooldown.getProgress() * 100) : 0;
            
            let colorClass = '';
            switch(spell.id) {
                case 0: colorClass = 'spell-fire'; break;
                case 1: colorClass = 'spell-ice'; break;
                case 2: colorClass = 'spell-plasma'; break;
                case 3: colorClass = 'spell-heal'; break;
            }
            
            return `
                <div class="spell-slot ${colorClass} ${isReady ? 'ready' : 'cooldown'}" 
                     data-spell-index="${index}">
                    <span class="key">${index + 1}</span>
                    <span class="name">${spell.name}</span>
                    ${!isReady ? `
                        <div class="cooldown-overlay" 
                             style="height:${100 - cooldownPercent}%">
                        </div>
                    ` : ''}
                    ${cooldown ? `
                        <div class="cooldown-text">
                            ${Math.ceil(cooldown.delay - cooldown.elapsed)}s
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        // Bind click events
        const spellSlots = this.elements.spellHotkeys.querySelectorAll('.spell-slot');
        spellSlots.forEach((slot, index) => {
            slot.onclick = () => {
                if (spells[index] && spells[index].ready && !activeCooldowns.has(index)) {
                    this.scene.castSpell(index);
                }
            };
        });
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    toggleModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.toggle('active');
        }
    }
    
    showSkillTree(availableSpells, skillPoints, onUnlock) {
        const modal = document.getElementById('skillTreeModal');
        const container = document.getElementById('spellOptions');
        
        if (!modal || !container) return;
        
        // Update skill points display
        const pointsDisplay = modal.querySelector('#availableSkillPoints');
        if (pointsDisplay) {
            pointsDisplay.textContent = skillPoints;
        }
        
        // Populate spell options
        if (availableSpells.length === 0) {
            container.innerHTML = '<p class="no-spells">No new spells available yet!</p>';
        } else {
            container.innerHTML = availableSpells.map(spell => `
                <div class="spell-option" data-spell-id="${spell.id}">
                    <h3><i class="${spell.icon}"></i> ${spell.name}</h3>
                    <p class="spell-desc">${spell.description}</p>
                    <div class="spell-stats">
                        ${spell.damage > 0 ? 
                            `<div class="stat"><i class="fas fa-bolt"></i> Damage: ${spell.damage}</div>` : 
                            `<div class="stat"><i class="fas fa-heart"></i> Heal: ${-spell.damage}</div>`}
                        <div class="stat"><i class="fas fa-clock"></i> Cooldown: ${spell.cooldown}</div>
                    </div>
                    <button class="btn-primary unlock-btn" 
                            ${skillPoints < 1 ? 'disabled' : ''}
                            data-spell-id="${spell.id}">
                        <i class="fas fa-unlock"></i> Unlock (1 Point)
                    </button>
                </div>
            `).join('');
            
            // Bind unlock buttons
            container.querySelectorAll('.unlock-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const spellId = parseInt(e.target.dataset.spellId || e.target.closest('.unlock-btn').dataset.spellId);
                    if (onUnlock) {
                        onUnlock(spellId);
                    }
                };
            });
        }
        
        // Show modal
        this.showModal('skillTreeModal');
    }
    
    showGameOver(stats) {
        const modal = document.getElementById('gameOverModal');
        
        if (!modal) return;
        
        // Update stats
        if (stats) {
            if (stats.wave) modal.querySelector('#defeatWave').textContent = stats.wave;
            if (stats.level) modal.querySelector('#defeatLevel').textContent = stats.level;
            if (stats.spells) modal.querySelector('#defeatSpells').textContent = stats.spells;
        }
        
        // Show modal
        this.showModal('gameOverModal');
    }
    
    updateAll() {
        // Update all UI elements based on current game state
        if (this.scene.player) {
            const player = this.scene.player.data;
            this.updateHealth(player.hp, player.maxHp);
            this.updateXP(player.xp, player.xpToNext, player.level);
            this.updateSkillPoints(player.skillPoints);
        }
        
        if (this.scene.wave) {
            this.updateWave(this.scene.wave);
        }
    }
    
    // Screen transitions
    fadeOut(duration = 500) {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'screen-fade';
            overlay.style.animation = `fadeIn ${duration}ms forwards`;
            document.body.appendChild(overlay);
            
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }
    
    fadeIn(duration = 500) {
        return new Promise(resolve => {
            const overlays = document.querySelectorAll('.screen-fade');
            overlays.forEach(overlay => {
                overlay.style.animation = `fadeOut ${duration}ms forwards`;
                
                setTimeout(() => {
                    overlay.remove();
                }, duration);
            });
            
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }
}

// Make globally available
window.UISystem = UISystem;

// Add CSS for new UI elements
const style = document.createElement('style');
style.textContent = `
    .log-entry {
        padding: 0.3rem 0.5rem;
        margin-bottom: 0.2rem;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.05);
        border-left: 3px solid var(--primary);
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: opacity 0.3s ease;
    }
    
    .log-damage {
        border-left-color: var(--danger);
    }
    
    .log-heal {
        border-left-color: var(--heal);
    }
    
    .log-spell {
        border-left-color: var(--secondary);
    }
    
    .log-level {
        border-left-color: var(--xp);
    }
    
    .log-warning {
        border-left-color: #ffcc00;
    }
    
    .log-timestamp {
        color: var(--text-dim);
        font-size: 0.75rem;
        min-width: 60px;
    }
    
    .log-icon {
        width: 20px;
        text-align: center;
    }
    
    .log-text {
        flex: 1;
    }
    
    .spell-fire {
        border-color: var(--danger) !important;
    }
    
    .spell-ice {
        border-color: var(--primary) !important;
    }
    
    .spell-plasma {
        border-color: var(--secondary) !important;
    }
    
    .spell-heal {
        border-color: var(--heal) !important;
    }
    
    .cooldown-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.2rem;
        font-weight: bold;
        color: white;
        text-shadow: 0 0 5px black;
    }
    
    .no-spells {
        text-align: center;
        padding: 2rem;
        color: var(--text-dim);
    }
    
    .spell-desc {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin: 0.5rem 0;
    }
    
    .spell-stats {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
        font-size: 0.9rem;
    }
    
    .spell-stats .stat {
        display: flex;
        align-items: center;
        gap: 0.3rem;
    }
    
    .screen-fade {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: black;
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;

document.head.appendChild(style);