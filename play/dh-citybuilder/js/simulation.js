// ============================================================
// MegaCity Builder - Simulation Engine
// ============================================================

class Simulation {
    constructor(map, economy) {
        this.map = map;
        this.economy = economy;
        this.events = new EventEmitter();

        // Derived stats
        this.stats = {
            totalCapacity: 0,
            totalJobs: 0,
            totalIncome: 0,
            totalMaintenance: 0,
            powerSupply: 0,
            powerDemand: 0,
            waterSupply: 0,
            waterDemand: 0,
            unemployed: 0,
            homelessRate: 0,
            avgPollution: 0,
            avgSafety: 0,
            avgHealth: 0,
            avgEducation: 0,
            avgFireProtection: 0,
            happinessFactors: {},
        };
    }

    // Run one simulation tick
    tick() {
        const timeEvent = this.economy.tick();

        this._updateBuildingStates();
        this._updatePopulation();
        this._calculateHappiness();
        this._updateStats();

        if (timeEvent === 'month') {
            const mapStats = this.map.getStats();
            this.economy.calculateBudget(mapStats);
            this.economy.applyMonthlyBudget();
            this._checkEvents();
            this.events.emit('monthEnd');
        }

        // Check disasters occasionally
        if (Math.random() < 0.001) {
            this._checkDisasters();
        }

        this.events.emit('tick');
    }

    _updateBuildingStates() {
        const mapStats = this.map.getStats();

        const hasPower = mapStats.totalPowerOutput >= mapStats.totalPowerDemand;
        const hasWater = mapStats.totalWaterOutput >= mapStats.totalWaterDemand;

        // Simple: if global supply meets demand, all buildings are powered/watered
        // More advanced would use grid-based distribution
        for (const b of this.map.buildings) {
            b.powered = hasPower || (b.def.needsPower === 0);
            b.watered = hasWater || (b.def.needsWater === 0);
            b.active = b.powered && b.watered;
            b.age++;

            // Grow occupancy for residential
            if (b.def.category === 'residential' && b.active) {
                if (b.occupancy < (b.def.capacity || 0)) {
                    const growthRate = this.economy.happiness > 40 ? 0.5 : 0.1;
                    b.occupancy = Math.min(b.def.capacity, b.occupancy + growthRate);
                }
            }
        }
    }

    _updatePopulation() {
        let totalPop = 0;
        for (const b of this.map.buildings) {
            if (b.def.category === 'residential') {
                totalPop += Math.floor(b.occupancy);
            }
        }
        this.economy.population = totalPop;
    }

    _calculateHappiness() {
        const factors = {};
        let happiness = 50; // Base happiness

        const mapStats = this.map.getStats();
        const pop = this.economy.population;

        if (pop === 0) {
            this.economy.happiness = 50;
            this.stats.happinessFactors = { 'No population': 0 };
            return;
        }

        // Tax rate factor (-15 to +5)
        const taxFactor = (CONFIG.TAX_RATE_DEFAULT - this.economy.taxRate) * 100;
        factors['Tax Rate'] = Utils.clamp(taxFactor, -15, 5);
        happiness += factors['Tax Rate'];

        // Jobs factor (-20 to +10)
        const jobRatio = mapStats.totalJobs / Math.max(1, pop * 0.5);
        factors['Employment'] = Utils.clamp((jobRatio - 0.5) * 30, -20, 10);
        happiness += factors['Employment'];

        // Service coverage: safety
        const avgSafety = this._getAverageServiceCoverage('safety');
        factors['Safety'] = Utils.clamp(avgSafety * 15 - 5, -10, 15);
        happiness += factors['Safety'];

        // Service coverage: health
        const avgHealth = this._getAverageServiceCoverage('health');
        factors['Healthcare'] = Utils.clamp(avgHealth * 12 - 3, -8, 12);
        happiness += factors['Healthcare'];

        // Service coverage: education
        const avgEdu = this._getAverageServiceCoverage('education');
        factors['Education'] = Utils.clamp(avgEdu * 10 - 2, -5, 10);
        happiness += factors['Education'];

        // Happiness from recreation buildings
        const avgHappiness = this._getAverageServiceCoverage('happiness');
        factors['Recreation'] = Utils.clamp(avgHappiness * 12, 0, 15);
        happiness += factors['Recreation'];

        // Direct happiness bonuses from buildings
        let happinessBonus = 0;
        for (const b of this.map.buildings) {
            if (b.def.happiness && b.active) {
                happinessBonus += b.def.happiness;
            }
        }
        factors['Amenities'] = Utils.clamp(happinessBonus / Math.max(1, pop / 50), 0, 15);
        happiness += factors['Amenities'];

        // Pollution penalty
        const avgPollution = this._getAveragePollution();
        factors['Pollution'] = Utils.clamp(-avgPollution * 3, -20, 0);
        happiness += factors['Pollution'];

        // Power/Water shortages
        if (mapStats.totalPowerOutput < mapStats.totalPowerDemand) {
            factors['Power Shortage'] = -15;
            happiness += factors['Power Shortage'];
        }
        if (mapStats.totalWaterOutput < mapStats.totalWaterDemand) {
            factors['Water Shortage'] = -15;
            happiness += factors['Water Shortage'];
        }

        // Housing shortage
        if (pop > mapStats.totalCapacity * 0.9 && mapStats.totalCapacity > 0) {
            factors['Overcrowding'] = -10;
            happiness += factors['Overcrowding'];
        }

        this.economy.happiness = Utils.clamp(Math.round(happiness), 0, 100);
        this.stats.happinessFactors = factors;
    }

    _getAverageServiceCoverage(type) {
        let total = 0;
        let count = 0;
        const coverage = this.map.serviceCoverage[type];
        if (!coverage) return 0;

        // Only measure coverage where there are residential buildings
        for (const b of this.map.buildings) {
            if (b.def.category === 'residential') {
                for (let dy = 0; dy < b.height; dy++) {
                    for (let dx = 0; dx < b.width; dx++) {
                        total += coverage[b.y + dy][b.x + dx] || 0;
                        count++;
                    }
                }
            }
        }
        return count > 0 ? total / count : 0;
    }

    _getAveragePollution() {
        let total = 0;
        let count = 0;
        for (const b of this.map.buildings) {
            if (b.def.category === 'residential') {
                for (let dy = 0; dy < b.height; dy++) {
                    for (let dx = 0; dx < b.width; dx++) {
                        total += this.map.pollutionGrid[b.y + dy][b.x + dx] || 0;
                        count++;
                    }
                }
            }
        }
        return count > 0 ? total / count : 0;
    }

    _updateStats() {
        const mapStats = this.map.getStats();
        this.stats.totalCapacity = mapStats.totalCapacity;
        this.stats.totalJobs = mapStats.totalJobs;
        this.stats.totalIncome = mapStats.totalIncome;
        this.stats.totalMaintenance = mapStats.totalMaintenance;
        this.stats.powerSupply = mapStats.totalPowerOutput;
        this.stats.powerDemand = mapStats.totalPowerDemand;
        this.stats.waterSupply = mapStats.totalWaterOutput;
        this.stats.waterDemand = mapStats.totalWaterDemand;

        const pop = this.economy.population;
        this.stats.unemployed = Math.max(0, Math.floor(pop * 0.5) - mapStats.totalJobs);
        this.stats.homelessRate = mapStats.totalCapacity > 0
            ? Math.max(0, (pop - mapStats.totalCapacity) / pop) : 0;
        this.stats.avgPollution = this._getAveragePollution();
        this.stats.avgSafety = this._getAverageServiceCoverage('safety');
        this.stats.avgHealth = this._getAverageServiceCoverage('health');
        this.stats.avgEducation = this._getAverageServiceCoverage('education');
        this.stats.avgFireProtection = this._getAverageServiceCoverage('fire');
    }

    _checkEvents() {
        // Population milestones
        const pop = this.economy.population;
        const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000];
        for (const m of milestones) {
            if (pop >= m && pop - 50 < m) {
                this.events.emit('milestone', {
                    type: 'population',
                    value: m,
                    message: `🎉 Population reached ${Utils.formatNumber(m)}!`
                });
            }
        }

        // Check if money is critically low
        if (this.economy.money < 0) {
            this.events.emit('crisis', {
                type: 'bankruptcy',
                message: '⚠️ The city is in debt! Reduce expenses or increase income.'
            });
        }
    }

    _checkDisasters() {
        if (this.map.buildings.length < 10) return;

        for (const [type, disaster] of Object.entries(DISASTERS)) {
            if (Math.random() < disaster.chance) {
                // Pick a random building
                const target = Utils.randomChoice(this.map.buildings);
                if (target.type === 'road') continue;

                this.events.emit('disaster', {
                    type,
                    building: target,
                    message: `${disaster.icon} ${disaster.message} (${target.def.name} at ${target.x},${target.y})`,
                });

                // Fire: damage building
                if (type === 'fire') {
                    const hasFire = this.map.serviceCoverage.fire[target.y]?.[target.x] > 0.3;
                    if (!hasFire) {
                        // Destroy building if no fire protection
                        this.map.removeBuilding(target.x, target.y);
                        this.events.emit('notification', {
                            message: `🔥 ${target.def.name} destroyed by fire!`,
                            type: 'danger',
                        });
                    } else {
                        this.events.emit('notification', {
                            message: `🚒 Firefighters saved ${target.def.name}!`,
                            type: 'success',
                        });
                    }
                }
                break;
            }
        }
    }
}
