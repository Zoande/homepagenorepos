// ============================================================
// MegaCity Builder - Audio (Web Audio API Sound Effects)
// ============================================================

class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.volume = 0.3;
        this._initialized = false;
    }

    init() {
        if (this._initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._initialized = true;
        } catch (e) {
            console.warn('Web Audio API not available');
            this.enabled = false;
        }
    }

    _ensureContext() {
        if (!this._initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Play a simple tone
    _playTone(frequency, duration, type = 'sine', gainVal = null) {
        if (!this.enabled || !this.ctx) return;
        this._ensureContext();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
        gain.gain.setValueAtTime((gainVal || this.volume) * 0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    }

    // Play noise burst
    _playNoise(duration, gainVal = null) {
        if (!this.enabled || !this.ctx) return;
        this._ensureContext();

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime((gainVal || this.volume) * 0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        source.start();
    }

    // Sound effects
    playBuild() {
        this._playTone(440, 0.1, 'square');
        setTimeout(() => this._playTone(554, 0.1, 'square'), 50);
        setTimeout(() => this._playTone(659, 0.15, 'square'), 100);
    }

    playDemolish() {
        this._playNoise(0.3);
        this._playTone(200, 0.2, 'sawtooth');
    }

    playClick() {
        this._playTone(800, 0.05, 'sine', 0.15);
    }

    playError() {
        this._playTone(200, 0.15, 'square');
        setTimeout(() => this._playTone(150, 0.2, 'square'), 100);
    }

    playNotification() {
        this._playTone(523, 0.1, 'sine');
        setTimeout(() => this._playTone(659, 0.15, 'sine'), 100);
    }

    playMilestone() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 0.2, 'sine'), i * 100);
        });
    }

    playDisaster() {
        this._playTone(100, 0.5, 'sawtooth', 0.4);
        this._playNoise(0.5, 0.3);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}
