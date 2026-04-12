// ============================================================
// MegaCity Builder - Economy System
// ============================================================

class Economy {
    constructor() {
        this.money = CONFIG.INITIAL_MONEY;
        this.taxRate = CONFIG.TAX_RATE_DEFAULT;
        this.population = 0;
        this.happiness = 50;
        this.month = 1;
        this.year = 2026;
        this.day = 1;
        this.tickCount = 0;

        // History for graphs
        this.history = {
            money: [],
            population: [],
            happiness: [],
            income: [],
            expenses: [],
        };

        // Current period stats
        this.periodIncome = 0;
        this.periodExpenses = 0;
        this.periodTax = 0;
        this.periodCommercial = 0;
        this.periodMaintenance = 0;
    }

    canAfford(amount) {
        return this.money >= amount;
    }

    spend(amount, reason) {
        if (this.money < amount) return false;
        this.money -= amount;
        return true;
    }

    earn(amount, reason) {
        this.money += amount;
    }

    // Calculate income/expenses per tick
    calculateBudget(mapStats) {
        // Tax income from population
        const taxIncome = this.population * this.taxRate * 2;
        this.periodTax = taxIncome;

        // Commercial & industrial income
        const commercialIncome = mapStats.totalIncome;
        this.periodCommercial = commercialIncome;

        // Total income
        this.periodIncome = taxIncome + commercialIncome;

        // Maintenance costs
        this.periodMaintenance = mapStats.totalMaintenance;
        this.periodExpenses = this.periodMaintenance;

        return {
            income: this.periodIncome,
            expenses: this.periodExpenses,
            net: this.periodIncome - this.periodExpenses,
        };
    }

    // Apply monthly budget
    applyMonthlyBudget() {
        const net = this.periodIncome - this.periodExpenses;
        this.money += net;

        // Record history
        this.history.money.push(this.money);
        this.history.population.push(this.population);
        this.history.happiness.push(this.happiness);
        this.history.income.push(this.periodIncome);
        this.history.expenses.push(this.periodExpenses);

        // Keep only last 60 months
        const maxHistory = 60;
        for (const key in this.history) {
            if (this.history[key].length > maxHistory) {
                this.history[key] = this.history[key].slice(-maxHistory);
            }
        }
    }

    // Advance time
    tick() {
        this.tickCount++;
        this.day++;

        if (this.day > CONFIG.MONTH_LENGTH) {
            this.day = 1;
            this.month++;
            if (this.month > 12) {
                this.month = 1;
                this.year++;
            }
            return 'month'; // Signal monthly processing
        }
        return 'day';
    }

    getDateString() {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[this.month - 1]} ${this.year}`;
    }

    getDayProgress() {
        return this.day / CONFIG.MONTH_LENGTH;
    }

    setTaxRate(rate) {
        this.taxRate = Utils.clamp(rate, CONFIG.TAX_RATE_MIN, CONFIG.TAX_RATE_MAX);
    }

    serialize() {
        return {
            money: this.money,
            taxRate: this.taxRate,
            population: this.population,
            happiness: this.happiness,
            month: this.month,
            year: this.year,
            day: this.day,
            tickCount: this.tickCount,
            history: this.history,
        };
    }

    static deserialize(data) {
        const eco = new Economy();
        Object.assign(eco, data);
        return eco;
    }
}
