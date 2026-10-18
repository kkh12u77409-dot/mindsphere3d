class SoundEngine {
  private ctx: AudioContext | null = null;
  public sfxEnabled: boolean = true;
  public musicEnabled: boolean = true;
  public sfxVolume: number = 0.8;
  public musicVolume: number = 0.5;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;

  constructor() {
    try {
      const saved = localStorage.getItem('mindsphere_audio');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.sfxEnabled = parsed.sfxEnabled ?? true;
        this.musicEnabled = parsed.musicEnabled ?? true;
        this.sfxVolume = parsed.sfxVolume ?? 0.8;
        this.musicVolume = parsed.musicVolume ?? 0.5;
      }
    } catch (e) {
      console.warn('Audio settings load error', e);
    }
  }

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.musicEnabled && !this.ambientOsc) {
      this.startAmbient();
    }
  }

  public saveSettings() {
    try {
      localStorage.setItem('mindsphere_audio', JSON.stringify({
        sfxEnabled: this.sfxEnabled,
        musicEnabled: this.musicEnabled,
        sfxVolume: this.sfxVolume,
        musicVolume: this.musicVolume
      }));
    } catch {}
  }

  public triggerHaptic(ms: number = 30) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {}
    }
  }

  public playClick() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.triggerHaptic(15);

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  public playRotate() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.triggerHaptic(25);

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch {}
  }

  public playSelect() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.triggerHaptic(20);

    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);
        gain.gain.setValueAtTime(0.18 * this.sfxVolume, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.16);
      });
    } catch {}
  }

  public playToggle() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.triggerHaptic(30);

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);

      gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  public playCorrect() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.triggerHaptic(40);

    try {
      const notes = [440, 554.37, 659.25, 880];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.07;
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.22 * this.sfxVolume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {}
  }

  public playWrong() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.triggerHaptic(70);

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.linearRampToValueAtTime(95, now + 0.2);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch {}
  }

  public playDoorOpen() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.triggerHaptic(100);

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(70, now);
      osc1.frequency.linearRampToValueAtTime(140, now + 0.8);
      gain1.gain.setValueAtTime(0.35 * this.sfxVolume, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 1.25);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(400, now + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.7);
      gain2.gain.setValueAtTime(0.2 * this.sfxVolume, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.95);
    } catch {}
  }

  public playVictory() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.triggerHaptic(150);

    try {
      const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      const now = this.ctx.currentTime;

      chord.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const start = now + i * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25 * this.sfxVolume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.95);
      });
    } catch {}
  }

  public playAchievement() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.triggerHaptic(120);

    try {
      const chord = [659.25, 830.61, 987.77, 1318.51, 1661.22];
      const now = this.ctx.currentTime;

      chord.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const start = now + i * 0.07;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.28 * this.sfxVolume, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.65);
      });
    } catch {}
  }

  public playTick() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.triggerHaptic(10);

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.03);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  public playTimeout() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    this.triggerHaptic(80);

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.5);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.56);
    } catch {}
  }

  public startAmbient() {
    if (!this.musicEnabled || this.ambientOsc || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.setValueAtTime(110, now);

      this.ambientGain.gain.setValueAtTime(0.04 * this.musicVolume, now);

      this.ambientOsc.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);
      this.ambientOsc.start();
    } catch (e) {
      console.warn('Ambient sound start error', e);
    }
  }

  public stopAmbient() {
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch {}
      this.ambientOsc = null;
      this.ambientGain = null;
    }
  }

  public setMusic(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.init();
      this.startAmbient();
    } else {
      this.stopAmbient();
    }
    this.saveSettings();
  }

  public setSFX(enabled: boolean) {
    this.sfxEnabled = enabled;
    this.saveSettings();
  }
}

export const AudioSys = new SoundEngine();
