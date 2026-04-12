// ============================================================
// MegaCity Builder - UI Manager (HUD, Menus, Notifications)
// ============================================================

class UI {
    constructor(game) {
        this.game = game;
        this.notifications = [];
        this.maxNotifications = 5;
        this.selectedCategory = null;
        this.showBuildMenu = false;
        this.showStatsPanel = false;
        this.showBudgetPanel = false;
        this.showGrid = true;

        // DOM elements cache
        this.elements = {};

        this._buildUI();
    }

    _buildUI() {
        // ---- TOP BAR (Stats HUD) ----
        const topBar = document.createElement('div');
        topBar.id = 'top-bar';
        topBar.innerHTML = `
            <div class="stat-group">
                <div class="stat" id="stat-money" title="City Treasury">
                    <span class="stat-icon">💰</span>
                    <span class="stat-value" id="money-value">$50,000</span>
                </div>
                <div class="stat" id="stat-population" title="Population">
                    <span class="stat-icon">👥</span>
                    <span class="stat-value" id="pop-value">0</span>
                </div>
                <div class="stat" id="stat-happiness" title="Happiness">
                    <span class="stat-icon">😊</span>
                    <span class="stat-value" id="happy-value">50%</span>
                    <div class="stat-bar">
                        <div class="stat-bar-fill" id="happy-bar" style="width:50%"></div>
                    </div>
                </div>
            </div>
            <div class="stat-group">
                <div class="stat" id="stat-power" title="Power Supply/Demand">
                    <span class="stat-icon">⚡</span>
                    <span class="stat-value" id="power-value">0/0</span>
                </div>
                <div class="stat" id="stat-water" title="Water Supply/Demand">
                    <span class="stat-icon">💧</span>
                    <span class="stat-value" id="water-value">0/0</span>
                </div>
            </div>
            <div class="stat-group">
                <div class="stat" id="stat-date" title="Current Date">
                    <span class="stat-icon">📅</span>
                    <span class="stat-value" id="date-value">Jan 2026</span>
                </div>
                <div class="speed-controls" id="speed-controls">
                    <button class="speed-btn" data-speed="0" title="Pause (1)">⏸</button>
                    <button class="speed-btn active" data-speed="1" title="Normal (2)">▶</button>
                    <button class="speed-btn" data-speed="2" title="Fast (3)">▶▶</button>
                    <button class="speed-btn" data-speed="3" title="Very Fast (4)">▶▶▶</button>
                </div>
            </div>
        `;
        document.body.appendChild(topBar);

        // ---- BOTTOM BUILD BAR ----
        const buildBar = document.createElement('div');
        buildBar.id = 'build-bar';

        // Category tabs
        let categoryHTML = '<div class="category-tabs" id="category-tabs">';
        for (const [key, cat] of Object.entries(CATEGORIES)) {
            categoryHTML += `<button class="cat-btn" data-category="${key}" title="${cat.name}">
                <span class="cat-icon">${cat.icon}</span>
                <span class="cat-name">${cat.name}</span>
            </button>`;
        }
        // Demolish button
        categoryHTML += `<button class="cat-btn demolish-btn" id="demolish-btn" title="Demolish (X)">
            <span class="cat-icon">🗑️</span>
            <span class="cat-name">Demolish</span>
        </button>`;
        categoryHTML += '</div>';

        // Building items (hidden by default)
        categoryHTML += '<div class="building-panel" id="building-panel"></div>';

        buildBar.innerHTML = categoryHTML;
        document.body.appendChild(buildBar);

        // ---- NOTIFICATION CONTAINER ----
        const notifContainer = document.createElement('div');
        notifContainer.id = 'notifications';
        document.body.appendChild(notifContainer);

        // ---- INFO PANEL (building inspector) ----
        const infoPanel = document.createElement('div');
        infoPanel.id = 'info-panel';
        infoPanel.className = 'panel hidden';
        infoPanel.innerHTML = `
            <div class="panel-header">
                <span id="info-title">Building Info</span>
                <button class="panel-close" id="info-close">✕</button>
            </div>
            <div class="panel-body" id="info-body"></div>
        `;
        document.body.appendChild(infoPanel);

        // ---- BUDGET PANEL ----
        const budgetPanel = document.createElement('div');
        budgetPanel.id = 'budget-panel';
        budgetPanel.className = 'panel hidden';
        budgetPanel.innerHTML = `
            <div class="panel-header">
                <span>💰 Budget Overview</span>
                <button class="panel-close" id="budget-close">✕</button>
            </div>
            <div class="panel-body" id="budget-body"></div>
        `;
        document.body.appendChild(budgetPanel);

        // ---- STATS DETAIL PANEL ----
        const statsPanel = document.createElement('div');
        statsPanel.id = 'stats-panel';
        statsPanel.className = 'panel hidden';
        statsPanel.innerHTML = `
            <div class="panel-header">
                <span>📊 City Statistics</span>
                <button class="panel-close" id="stats-close">✕</button>
            </div>
            <div class="panel-body" id="stats-body"></div>
        `;
        document.body.appendChild(statsPanel);

        // ---- TOOLTIP ----
        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.className = 'hidden';
        document.body.appendChild(tooltip);

        // ---- WELCOME SCREEN ----
        const welcome = document.createElement('div');
        welcome.id = 'welcome-screen';
        welcome.innerHTML = `
            <div class="welcome-content">
                <h1>🏙️ MegaCity Builder</h1>
                <p>Build your dream city from the ground up!</p>
                <div class="welcome-tips">
                    <h3>Quick Tips:</h3>
                    <ul>
                        <li>🛣️ Start by building <strong>roads</strong> (press R)</li>
                        <li>⚡ Place a <strong>power plant</strong> and 💧 <strong>water tower</strong></li>
                        <li>🏠 Zone <strong>residential</strong> areas for people to move in</li>
                        <li>🏪 Add <strong>commercial</strong> buildings for jobs and income</li>
                        <li>🚔 Build <strong>services</strong> to keep citizens happy</li>
                        <li>Right-click drag to <strong>pan</strong>, scroll to <strong>zoom</strong></li>
                        <li>Press <strong>Space</strong> to pause/resume</li>
                    </ul>
                </div>
                <button id="start-btn" class="primary-btn">🏗️ Start Building!</button>
                <button id="load-btn" class="secondary-btn">📂 Load Saved City</button>
            </div>
        `;
        document.body.appendChild(welcome);

        // Cache element references
        this._cacheElements();
        this._bindUIEvents();
    }

    _cacheElements() {
        this.elements = {
            moneyValue: document.getElementById('money-value'),
            popValue: document.getElementById('pop-value'),
            happyValue: document.getElementById('happy-value'),
            happyBar: document.getElementById('happy-bar'),
            powerValue: document.getElementById('power-value'),
            waterValue: document.getElementById('water-value'),
            dateValue: document.getElementById('date-value'),
            buildingPanel: document.getElementById('building-panel'),
            categoryTabs: document.getElementById('category-tabs'),
            demolishBtn: document.getElementById('demolish-btn'),
            notifications: document.getElementById('notifications'),
            infoPanel: document.getElementById('info-panel'),
            infoTitle: document.getElementById('info-title'),
            infoBody: document.getElementById('info-body'),
            infoClose: document.getElementById('info-close'),
            budgetPanel: document.getElementById('budget-panel'),
            budgetBody: document.getElementById('budget-body'),
            budgetClose: document.getElementById('budget-close'),
            statsPanel: document.getElementById('stats-panel'),
            statsBody: document.getElementById('stats-body'),
            statsClose: document.getElementById('stats-close'),
            tooltip: document.getElementById('tooltip'),
            welcomeScreen: document.getElementById('welcome-screen'),
            startBtn: document.getElementById('start-btn'),
            loadBtn: document.getElementById('load-btn'),
            speedControls: document.getElementById('speed-controls'),
            statMoney: document.getElementById('stat-money'),
            statPopulation: document.getElementById('stat-population'),
            statHappiness: document.getElementById('stat-happiness'),
        };
    }

    _bindUIEvents() {
        // Start button
        this.elements.startBtn.addEventListener('click', () => {
            this.elements.welcomeScreen.style.display = 'none';
            this.game.start();
        });

        // Load button
        this.elements.loadBtn.addEventListener('click', () => {
            if (this.game.loadGame()) {
                this.elements.welcomeScreen.style.display = 'none';
            } else {
                this.addNotification('No saved game found!', 'warning');
            }
        });

        // Category buttons
        const catBtns = document.querySelectorAll('.cat-btn:not(.demolish-btn)');
        catBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.dataset.category;
                this._toggleCategory(cat);
            });
        });

        // Demolish button
        this.elements.demolishBtn.addEventListener('click', () => {
            this.game.toggleDemolish();
        });

        // Speed buttons
        const speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const speed = parseInt(btn.dataset.speed);
                this.game.setSpeed(speed);
            });
        });

        // Panel close buttons
        this.elements.infoClose.addEventListener('click', () => {
            this.elements.infoPanel.classList.add('hidden');
        });
        this.elements.budgetClose.addEventListener('click', () => {
            this.elements.budgetPanel.classList.add('hidden');
        });
        this.elements.statsClose.addEventListener('click', () => {
            this.elements.statsPanel.classList.add('hidden');
        });

        // Click money to toggle budget
        this.elements.statMoney.addEventListener('click', () => {
            this.toggleBudgetPanel();
        });

        // Click population to toggle stats
        this.elements.statPopulation.addEventListener('click', () => {
            this.toggleStatsPanel();
        });
    }

    _toggleCategory(category) {
        if (this.selectedCategory === category) {
            // Deselect
            this.selectedCategory = null;
            this.elements.buildingPanel.innerHTML = '';
            this.elements.buildingPanel.classList.remove('open');
            this.game.cancelSelection();
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            return;
        }

        this.selectedCategory = category;
        this.game.state.demolishMode = false;
        this.elements.demolishBtn.classList.remove('active');

        // Highlight active tab
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.cat-btn[data-category="${category}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Show buildings in this category
        this._showCategoryBuildings(category);
    }

    _showCategoryBuildings(category) {
        const panel = this.elements.buildingPanel;
        panel.innerHTML = '';
        panel.classList.add('open');

        for (const [key, def] of Object.entries(BUILDINGS)) {
            if (def.category !== category) continue;

            const item = document.createElement('div');
            item.className = 'building-item';
            item.dataset.building = key;

            const canAfford = this.game.economy.canAfford(def.cost);
            if (!canAfford) item.classList.add('cant-afford');

            item.innerHTML = `
                <div class="building-icon">${def.icon}</div>
                <div class="building-info">
                    <div class="building-name">${def.name}</div>
                    <div class="building-cost">${Utils.formatMoney(def.cost)}</div>
                </div>
            `;

            item.addEventListener('click', () => {
                if (this.game.economy.canAfford(def.cost)) {
                    this.game.selectBuilding(key);
                    document.querySelectorAll('.building-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                } else {
                    this.addNotification(`Can't afford ${def.name}!`, 'warning');
                }
            });

            item.addEventListener('mouseenter', (e) => {
                this._showBuildingTooltip(e, key, def);
            });

            item.addEventListener('mouseleave', () => {
                this.elements.tooltip.classList.add('hidden');
            });

            panel.appendChild(item);
        }
    }

    _showBuildingTooltip(event, key, def) {
        const tt = this.elements.tooltip;
        let html = `<strong>${def.name}</strong><br>`;
        html += `<span class="tt-desc">${def.description}</span><br>`;
        html += `<span class="tt-cost">Cost: ${Utils.formatMoney(def.cost)}</span><br>`;
        html += `<span class="tt-maint">Maintenance: ${Utils.formatMoney(def.maintenance)}/mo</span><br>`;

        if (def.capacity) html += `<span class="tt-info">Housing: ${def.capacity}</span><br>`;
        if (def.jobs) html += `<span class="tt-info">Jobs: ${def.jobs}</span><br>`;
        if (def.income) html += `<span class="tt-info">Income: ${Utils.formatMoney(def.income)}/mo</span><br>`;
        if (def.powerOutput) html += `<span class="tt-info">⚡ Power: +${def.powerOutput}</span><br>`;
        if (def.waterOutput) html += `<span class="tt-info">💧 Water: +${def.waterOutput}</span><br>`;
        if (def.needsPower) html += `<span class="tt-info">⚡ Needs: ${def.needsPower}</span><br>`;
        if (def.needsWater) html += `<span class="tt-info">💧 Needs: ${def.needsWater}</span><br>`;
        if (def.pollution) html += `<span class="tt-info tt-bad">🏭 Pollution: ${def.pollution}</span><br>`;
        if (def.happiness) html += `<span class="tt-info tt-good">😊 Happiness: +${def.happiness}</span><br>`;
        if (def.serviceRadius) html += `<span class="tt-info">📡 Range: ${def.serviceRadius} tiles</span><br>`;
        html += `<span class="tt-size">Size: ${def.size[0]}×${def.size[1]}</span>`;
        if (def.needsRoad) html += `<br><span class="tt-req">🛣️ Requires road access</span>`;

        tt.innerHTML = html;
        tt.classList.remove('hidden');

        // Position tooltip near mouse
        const rect = this.elements.tooltip.getBoundingClientRect();
        const x = event.clientX + 15;
        const y = event.clientY - rect.height - 10;
        tt.style.left = Math.min(x, window.innerWidth - rect.width - 10) + 'px';
        tt.style.top = Math.max(10, y) + 'px';
    }

    // ---- UPDATE HUD ----
    update() {
        const eco = this.game.economy;
        const sim = this.game.simulation;
        if (!eco || !sim) return;

        // Money
        this.elements.moneyValue.textContent = Utils.formatMoney(eco.money);
        this.elements.moneyValue.className = 'stat-value' +
            (eco.money < 1000 ? ' danger' : eco.money < 5000 ? ' warning' : '');

        // Population
        this.elements.popValue.textContent = Utils.formatNumber(eco.population);

        // Happiness
        this.elements.happyValue.textContent = eco.happiness + '%';
        this.elements.happyBar.style.width = eco.happiness + '%';
        this.elements.happyBar.className = 'stat-bar-fill' +
            (eco.happiness < 30 ? ' danger' : eco.happiness < 50 ? ' warning' : ' good');

        // Power
        const ps = sim.stats.powerSupply;
        const pd = sim.stats.powerDemand;
        this.elements.powerValue.textContent = `${ps}/${pd}`;
        this.elements.powerValue.className = 'stat-value' + (pd > ps ? ' danger' : '');

        // Water
        const ws = sim.stats.waterSupply;
        const wd = sim.stats.waterDemand;
        this.elements.waterValue.textContent = `${ws}/${wd}`;
        this.elements.waterValue.className = 'stat-value' + (wd > ws ? ' danger' : '');

        // Date
        this.elements.dateValue.textContent = eco.getDateString();

        // Refresh building affordability
        if (this.selectedCategory) {
            document.querySelectorAll('.building-item').forEach(item => {
                const key = item.dataset.building;
                const def = BUILDINGS[key];
                if (def) {
                    if (eco.canAfford(def.cost)) {
                        item.classList.remove('cant-afford');
                    } else {
                        item.classList.add('cant-afford');
                    }
                }
            });
        }

        // Update speed buttons
        document.querySelectorAll('.speed-btn').forEach(btn => {
            const s = parseInt(btn.dataset.speed);
            btn.classList.toggle('active', s === this.game.state.speedIndex);
        });

        // Update demolish button
        this.elements.demolishBtn.classList.toggle('active', this.game.state.demolishMode);
    }

    // ---- NOTIFICATIONS ----
    addNotification(message, type = 'info') {
        const notif = document.createElement('div');
        notif.className = `notification notif-${type}`;
        notif.innerHTML = `<span>${message}</span>`;

        this.elements.notifications.appendChild(notif);

        // Animate in
        requestAnimationFrame(() => notif.classList.add('show'));

        // Auto remove
        setTimeout(() => {
            notif.classList.remove('show');
            notif.classList.add('fade-out');
            setTimeout(() => notif.remove(), 400);
        }, 4000);

        // Limit
        const existing = this.elements.notifications.children;
        while (existing.length > this.maxNotifications) {
            existing[0].remove();
        }
    }

    // ---- INFO PANEL (Building Inspector) ----
    showBuildingInfo(building) {
        if (!building) {
            this.elements.infoPanel.classList.add('hidden');
            return;
        }

        const def = building.def;
        let html = `<div class="info-row"><strong>${def.icon} ${def.name}</strong></div>`;
        html += `<div class="info-row desc">${def.description}</div>`;
        html += `<hr>`;

        if (def.capacity) {
            html += `<div class="info-row">👥 Occupancy: ${Math.floor(building.occupancy)}/${def.capacity}</div>`;
        }
        if (def.jobs) html += `<div class="info-row">💼 Jobs: ${def.jobs}</div>`;
        if (def.income) html += `<div class="info-row">💰 Income: ${Utils.formatMoney(def.income)}/mo</div>`;
        html += `<div class="info-row">🔧 Maintenance: ${Utils.formatMoney(def.maintenance)}/mo</div>`;

        html += `<div class="info-row">⚡ Power: ${building.powered ? '✅' : '❌'}</div>`;
        html += `<div class="info-row">💧 Water: ${building.watered ? '✅' : '❌'}</div>`;
        html += `<div class="info-row">📍 Position: (${building.x}, ${building.y})</div>`;

        // Demolish button
        html += `<button class="demolish-building-btn" onclick="game.tryDemolish(${building.x}, ${building.y})">🗑️ Demolish (refund ${Utils.formatMoney(def.cost * 0.5)})</button>`;

        this.elements.infoBody.innerHTML = html;
        this.elements.infoTitle.textContent = `${def.icon} ${def.name}`;
        this.elements.infoPanel.classList.remove('hidden');
    }

    // ---- BUDGET PANEL ----
    toggleBudgetPanel() {
        this.elements.budgetPanel.classList.toggle('hidden');
        if (!this.elements.budgetPanel.classList.contains('hidden')) {
            this._updateBudgetPanel();
        }
    }

    _updateBudgetPanel() {
        const eco = this.game.economy;
        const net = eco.periodIncome - eco.periodExpenses;
        let html = '<div class="budget-section">';
        html += `<div class="budget-row income"><span>📈 Tax Income:</span><span>${Utils.formatMoney(eco.periodTax)}</span></div>`;
        html += `<div class="budget-row income"><span>🏪 Commercial:</span><span>${Utils.formatMoney(eco.periodCommercial)}</span></div>`;
        html += `<div class="budget-row total"><span>Total Income:</span><span class="good">${Utils.formatMoney(eco.periodIncome)}</span></div>`;
        html += '</div><hr><div class="budget-section">';
        html += `<div class="budget-row expense"><span>🔧 Maintenance:</span><span>${Utils.formatMoney(eco.periodMaintenance)}</span></div>`;
        html += `<div class="budget-row total"><span>Total Expenses:</span><span class="danger">${Utils.formatMoney(eco.periodExpenses)}</span></div>`;
        html += '</div><hr>';
        html += `<div class="budget-row net"><span><strong>Net Income:</strong></span><span class="${net >= 0 ? 'good' : 'danger'}"><strong>${Utils.formatMoney(net)}/mo</strong></span></div>`;

        // Tax slider
        html += `<div class="budget-section tax-section">`;
        html += `<label>Tax Rate: <strong>${(eco.taxRate * 100).toFixed(0)}%</strong></label>`;
        html += `<input type="range" id="tax-slider" min="1" max="20" value="${eco.taxRate * 100}" step="1">`;
        html += `</div>`;

        this.elements.budgetBody.innerHTML = html;

        // Tax slider event
        document.getElementById('tax-slider')?.addEventListener('input', (e) => {
            eco.setTaxRate(parseInt(e.target.value) / 100);
            this._updateBudgetPanel();
        });
    }

    // ---- STATS PANEL ----
    toggleStatsPanel() {
        this.elements.statsPanel.classList.toggle('hidden');
        if (!this.elements.statsPanel.classList.contains('hidden')) {
            this._updateStatsPanel();
        }
    }

    _updateStatsPanel() {
        const sim = this.game.simulation;
        const eco = this.game.economy;
        const s = sim.stats;

        let html = '<div class="stats-grid">';
        html += this._statRow('👥 Population', Utils.formatNumber(eco.population));
        html += this._statRow('🏠 Housing Capacity', Utils.formatNumber(s.totalCapacity));
        html += this._statRow('💼 Total Jobs', Utils.formatNumber(s.totalJobs));
        html += this._statRow('📉 Unemployed', Utils.formatNumber(s.unemployed));
        html += this._statRow('⚡ Power', `${s.powerSupply} / ${s.powerDemand}`);
        html += this._statRow('💧 Water', `${s.waterSupply} / ${s.waterDemand}`);
        html += this._statRow('🏭 Avg Pollution', s.avgPollution.toFixed(1));
        html += this._statRow('🚔 Safety Coverage', (s.avgSafety * 100).toFixed(0) + '%');
        html += this._statRow('🏥 Health Coverage', (s.avgHealth * 100).toFixed(0) + '%');
        html += this._statRow('🏫 Education', (s.avgEducation * 100).toFixed(0) + '%');
        html += this._statRow('🏗️ Buildings', this.game.map.buildings.length);
        html += '</div>';

        // Happiness breakdown
        html += '<hr><h4>😊 Happiness Factors</h4><div class="happiness-factors">';
        for (const [factor, value] of Object.entries(s.happinessFactors)) {
            const cls = value > 0 ? 'good' : value < 0 ? 'danger' : '';
            const sign = value > 0 ? '+' : '';
            html += `<div class="factor-row"><span>${factor}</span><span class="${cls}">${sign}${value.toFixed(0)}</span></div>`;
        }
        html += '</div>';

        this.elements.statsBody.innerHTML = html;
    }

    _statRow(label, value) {
        return `<div class="stat-detail-row"><span>${label}</span><span>${value}</span></div>`;
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
    }

    // Hide welcome screen
    hideWelcome() {
        this.elements.welcomeScreen.style.display = 'none';
    }
}
