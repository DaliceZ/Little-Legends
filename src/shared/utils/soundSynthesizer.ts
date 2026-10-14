class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVol: number = 0.8;
  private sfxVol: number = 0.8;
  private musicVol: number = 0.5;
  private currentMusicNode: { stop: () => void } | null = null;
  private currentTrack: string | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolumes(master: number, sfx: number, music: number) {
    this.masterVol = Math.max(0, Math.min(1, master));
    this.sfxVol = Math.max(0, Math.min(1, sfx));
    this.musicVol = Math.max(0, Math.min(1, music));
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.currentMusicNode) {
      this.currentMusicNode.stop();
      this.currentMusicNode = null;
    }
  }

  // Play standard retro sound effects
  playSfx(type: 'slash' | 'hit' | 'dodge' | 'pickup' | 'levelup' | 'quest' | 'click' | 'potion' | 'boss_roar' | 'crystal' | 'fire' | 'ice' | 'shadow' | 'lightning' | 'earth' | 'ultimate' | 'victory' | 'wind' | 'error' | 'warning') {
    if (this.isMuted || this.masterVol <= 0 || this.sfxVol <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    const netVolume = this.masterVol * this.sfxVol * 0.4;
    gainNode.gain.setValueAtTime(netVolume, now);
    gainNode.connect(this.ctx.destination);

    switch (type) {
      case 'slash': {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.12);

        gainNode.gain.setValueAtTime(netVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(filter);
        filter.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'hit': {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

        gainNode.gain.setValueAtTime(netVolume * 1.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case 'dodge': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(480, now + 0.1);

        gainNode.gain.setValueAtTime(netVolume * 0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'pickup': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5

        gainNode.gain.setValueAtTime(netVolume * 0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'levelup': {
        const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const noteGain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const startTime = now + idx * 0.09;
          noteGain.gain.setValueAtTime(netVolume * 0.8, startTime);
          noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(startTime);
          osc.stop(startTime + 0.25);
        });
        break;
      }
      case 'quest': {
        const notes = [523, 659, 783, 1046]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const noteGain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const startTime = now + idx * 0.08;
          noteGain.gain.setValueAtTime(netVolume * 0.9, startTime);
          noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(startTime);
          osc.stop(startTime + 0.3);
        });
        break;
      }
      case 'crystal': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.25);

        gainNode.gain.setValueAtTime(netVolume * 0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'potion': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(640, now + 0.15);
        osc.frequency.linearRampToValueAtTime(480, now + 0.25);

        gainNode.gain.setValueAtTime(netVolume * 0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'click': {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

        gainNode.gain.setValueAtTime(netVolume * 0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.04);
        break;
      }
      case 'error': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.18);

        gainNode.gain.setValueAtTime(netVolume * 0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'warning': {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(370, now + 0.12);

        gainNode.gain.setValueAtTime(netVolume * 0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.14);
        break;
      }
      case 'boss_roar': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.6);

        gainNode.gain.setValueAtTime(netVolume * 1.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.8);
        break;
      }
      case 'fire': {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

        gainNode.gain.setValueAtTime(netVolume * 1.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(filter);
        filter.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'ice': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);

        gainNode.gain.setValueAtTime(netVolume * 0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'shadow': {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.35);

        gainNode.gain.setValueAtTime(netVolume * 0.9, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.35);
        break;
      }
      case 'lightning': {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1600, now + 0.05);
        osc.frequency.setValueAtTime(400, now + 0.1);

        gainNode.gain.setValueAtTime(netVolume * 0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case 'earth': {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.4);

        gainNode.gain.setValueAtTime(netVolume * 1.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'ultimate': {
        const chord = [220, 277.18, 329.63, 440];
        chord.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const noteGain = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = freq;
          const startTime = now + idx * 0.06;
          noteGain.gain.setValueAtTime(netVolume * 0.9, startTime);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);
          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(startTime);
          osc.stop(startTime + 0.75);
        });
        break;
      }
      case 'victory': {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const noteGain = this.ctx!.createGain();
          const startTime = now + idx * 0.08;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);
          noteGain.gain.setValueAtTime(netVolume, startTime);
          noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
          osc.connect(noteGain);
          noteGain.connect(gainNode);
          osc.start(startTime);
          osc.stop(startTime + 0.4);
        });
        break;
      }
      case 'wind': {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(700, now);
        gainNode.gain.setValueAtTime(netVolume * 0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(filter);
        filter.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }
    }
  }

  // Play procedural background ambient chiptune track
  playMusic(track: 'village' | 'dungeon') {
    if (this.currentTrack === track && this.currentMusicNode) return;
    this.stopMusic();
    this.currentTrack = track;

    if (this.isMuted || this.masterVol <= 0 || this.musicVol <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    let isRunning = true;
    let step = 0;

    // Melody loops
    const villageMelody = [
      261.63, 329.63, 392.00, 329.63, 349.23, 392.00, 440.00, 392.00,
      329.63, 261.63, 293.66, 329.63, 261.63, 0,      261.63, 0
    ];

    const dungeonMelody = [
      110.00, 130.81, 123.47, 98.00, 110.00, 146.83, 130.81, 123.47,
      110.00, 0,      130.81, 0,     98.00,  110.00, 123.47, 0
    ];

    const interval = setInterval(() => {
      if (!isRunning || !this.ctx || this.isMuted) return;
      const melody = track === 'village' ? villageMelody : dungeonMelody;
      const freq = melody[step % melody.length];
      step++;

      if (freq > 0) {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = track === 'village' ? 'sine' : 'sawtooth';
        osc.frequency.value = freq;

        const vol = this.masterVol * this.musicVol * (track === 'village' ? 0.12 : 0.08);
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.38);
      }
    }, 280);

    this.currentMusicNode = {
      stop: () => {
        isRunning = false;
        clearInterval(interval);
      },
    };
  }

  stopMusic() {
    if (this.currentMusicNode) {
      this.currentMusicNode.stop();
      this.currentMusicNode = null;
    }
    this.currentTrack = null;
  }
}

export const soundManager = new SoundSynthesizer();
