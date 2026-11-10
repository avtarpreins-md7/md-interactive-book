/**
 * Web Audio Engine for MD Luxury Digital Experience
 * Realistic ocean surf + simple harmonic ambient musical tones + paper flip DSP + deep sacred "Noon" vocal synthesis
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private oceanGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private oceanFilter1: BiquadFilterNode | null = null;
  private oceanFilter2: BiquadFilterNode | null = null;
  private isOceanPlaying: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.65;
  private oceanWaveTimer: number | null = null;
  private ambientMusicTimer: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.oceanGain) {
        this.oceanGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.20, now);
      }
      if (this.musicGain) {
        this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.14, now);
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Starts ambient ocean waves sound integrated with gentle, simple ambient musical notes
   */
  public startOceanWaves() {
    if (this.isOceanPlaying) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const sampleRate = this.ctx.sampleRate;
      const bufferSize = sampleRate * 5;
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      // Pink/Brown noise for wet ocean water texture
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // Filter 1: Deep ocean body swell
      this.oceanFilter1 = this.ctx.createBiquadFilter();
      this.oceanFilter1.type = 'lowpass';
      this.oceanFilter1.frequency.setValueAtTime(140, this.ctx.currentTime);
      this.oceanFilter1.Q.setValueAtTime(2.0, this.ctx.currentTime);

      // Filter 2: Foaming water crest
      this.oceanFilter2 = this.ctx.createBiquadFilter();
      this.oceanFilter2.type = 'bandpass';
      this.oceanFilter2.frequency.setValueAtTime(450, this.ctx.currentTime);
      this.oceanFilter2.Q.setValueAtTime(1.4, this.ctx.currentTime);

      const merger = this.ctx.createGain();
      merger.gain.setValueAtTime(1.0, this.ctx.currentTime);

      this.oceanGain = this.ctx.createGain();
      this.oceanGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.20, this.ctx.currentTime);

      noiseSource.connect(this.oceanFilter1);
      noiseSource.connect(this.oceanFilter2);
      this.oceanFilter1.connect(merger);
      this.oceanFilter2.connect(merger);
      merger.connect(this.oceanGain);
      this.oceanGain.connect(this.ctx.destination);

      noiseSource.start();
      this.isOceanPlaying = true;

      // Realistic wave roll cycle
      this.modulateOceanWaves();

      // Start gentle background musical notes harmonizing with the waves
      this.startAmbientMusic();
    } catch (e) {
      console.warn('Error starting ocean waves audio:', e);
    }
  }

  private modulateOceanWaves() {
    if (!this.oceanFilter1 || !this.oceanFilter2 || !this.ctx || !this.isOceanPlaying) return;

    const now = this.ctx.currentTime;
    const wavePeriod = 6.2;

    this.oceanFilter1.frequency.cancelScheduledValues(now);
    this.oceanFilter1.frequency.setValueAtTime(110, now);
    this.oceanFilter1.frequency.exponentialRampToValueAtTime(320, now + 2.5);
    this.oceanFilter1.frequency.exponentialRampToValueAtTime(110, now + wavePeriod);

    this.oceanFilter2.frequency.cancelScheduledValues(now);
    this.oceanFilter2.frequency.setValueAtTime(320, now);
    this.oceanFilter2.frequency.exponentialRampToValueAtTime(650, now + 2.8);
    this.oceanFilter2.frequency.exponentialRampToValueAtTime(280, now + wavePeriod);

    this.oceanWaveTimer = window.setTimeout(() => {
      if (this.isOceanPlaying) {
        this.modulateOceanWaves();
      }
    }, wavePeriod * 1000);
  }

  /**
   * Generates simple, gentle, ethereal musical tones (Pentatonic notes D - A - C - F)
   * that blend with the ocean waves
   */
  private startAmbientMusic() {
    if (!this.ctx) return;
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.14, this.ctx.currentTime);
    this.musicGain.connect(this.ctx.destination);

    // Simple peaceful musical notes (Hz)
    const notes = [146.83, 220.0, 261.63, 293.66, 349.23, 220.0]; // D3, A3, C4, D4, F4, A3
    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.isOceanPlaying || !this.ctx || !this.musicGain) return;

      const now = this.ctx.currentTime;
      const freq = notes[noteIdx];
      noteIdx = (noteIdx + 1) % notes.length;

      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const noteGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.002, now); // slight chorus detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      // Very soft slow attack and long gentle fade (5 seconds per note)
      const noteDuration = 5.5;
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.linearRampToValueAtTime(0.18, now + 2.0);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.musicGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + noteDuration + 0.1);
      osc2.stop(now + noteDuration + 0.1);

      this.ambientMusicTimer = window.setTimeout(playNextNote, 4800);
    };

    playNextNote();
  }

  public stopOceanWaves() {
    if (this.oceanWaveTimer) {
      clearTimeout(this.oceanWaveTimer);
      this.oceanWaveTimer = null;
    }
    if (this.ambientMusicTimer) {
      clearTimeout(this.ambientMusicTimer);
      this.ambientMusicTimer = null;
    }
    if (this.oceanGain && this.ctx) {
      try {
        this.oceanGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.0);
        if (this.musicGain) {
          this.musicGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.0);
        }
        setTimeout(() => {
          this.isOceanPlaying = false;
        }, 1000);
      } catch {
        this.isOceanPlaying = false;
      }
    } else {
      this.isOceanPlaying = false;
    }
  }

  /**
   * Pronounces «نُون» (Noon) with clean deep sacred vocal resonance and Arabic vocal tract harmonics
   * Plays purely the voice of «نُون» without triggering navigation or extraneous actions
   */
  public pronounceNoon(): Promise<void> {
    return new Promise((resolve) => {
      this.initContext();

      // 1. Synthesize resonant human voice box for «نُون»
      if (this.ctx && !this.isMuted) {
        const now = this.ctx.currentTime;

        // Rich fundamental oscillator: 98Hz (G2 deep vocal fundamental)
        const oscLow = this.ctx.createOscillator();
        const oscSub = this.ctx.createOscillator();
        const oscHarm = this.ctx.createOscillator();

        const formant1 = this.ctx.createBiquadFilter(); // F1 ~ 280Hz
        const formant2 = this.ctx.createBiquadFilter(); // F2 ~ 780Hz
        const vocalGain = this.ctx.createGain();

        oscLow.type = 'sawtooth';
        oscLow.frequency.setValueAtTime(104, now);
        oscLow.frequency.exponentialRampToValueAtTime(94, now + 1.8);

        oscSub.type = 'sine';
        oscSub.frequency.setValueAtTime(98, now);
        oscSub.frequency.exponentialRampToValueAtTime(88, now + 1.8);

        oscHarm.type = 'triangle';
        oscHarm.frequency.setValueAtTime(196, now);
        oscHarm.frequency.exponentialRampToValueAtTime(184, now + 1.8);

        // Formant filters modeling Arabic "N-OO-N"
        formant1.type = 'bandpass';
        formant1.frequency.setValueAtTime(260, now);
        formant1.frequency.exponentialRampToValueAtTime(360, now + 0.6);
        formant1.frequency.exponentialRampToValueAtTime(260, now + 1.8);
        formant1.Q.setValueAtTime(4.2, now);

        formant2.type = 'bandpass';
        formant2.frequency.setValueAtTime(740, now);
        formant2.frequency.exponentialRampToValueAtTime(820, now + 0.6);
        formant2.frequency.exponentialRampToValueAtTime(700, now + 1.8);
        formant2.Q.setValueAtTime(5.0, now);

        vocalGain.gain.setValueAtTime(0.001, now);
        vocalGain.gain.linearRampToValueAtTime(this.volume * 0.45, now + 0.22);
        vocalGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        oscLow.connect(formant1);
        oscSub.connect(formant1);
        oscHarm.connect(formant2);

        formant1.connect(vocalGain);
        formant2.connect(vocalGain);
        vocalGain.connect(this.ctx.destination);

        oscLow.start(now);
        oscSub.start(now);
        oscHarm.start(now);
        oscLow.stop(now + 2.1);
        oscSub.stop(now + 2.1);
        oscHarm.stop(now + 2.1);
      }

      // 2. Play speech synthesis with Arabic pronunciation if available
      if ('speechSynthesis' in window && !this.isMuted) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance('نُون');
          utterance.lang = 'ar-SA';
          utterance.pitch = 0.82;
          utterance.rate = 0.72;
          utterance.volume = this.volume;

          const voices = window.speechSynthesis.getVoices();
          const arVoice = voices.find((v) => v.lang.startsWith('ar'));
          if (arVoice) {
            utterance.voice = arVoice;
          }

          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();

          window.speechSynthesis.speak(utterance);
        } catch {
          resolve();
        }
      } else {
        setTimeout(resolve, 1900);
      }
    });
  }

  /**
   * Sound effect for realistic page flip
   */
  public playPageFlip(duration: number = 0.45) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const sampleRate = this.ctx.sampleRate;
      const totalSamples = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, totalSamples, sampleRate);
      const channelData = buffer.getChannelData(0);

      const rawNoise = new Float32Array(totalSamples + 1);
      for (let i = 0; i <= totalSamples; i += 2) {
        const u1 = Math.max(1e-9, Math.random());
        const u2 = Math.random();
        const mag = Math.sqrt(-2.0 * Math.log(u1));
        rawNoise[i] = mag * Math.cos(2.0 * Math.PI * u2);
        if (i + 1 <= totalSamples) {
          rawNoise[i + 1] = mag * Math.sin(2.0 * Math.PI * u2);
        }
      }

      const diffNoise = new Float32Array(totalSamples);
      let maxAbs = 0.0001;
      for (let i = 0; i < totalSamples; i++) {
        diffNoise[i] = rawNoise[i + 1] - rawNoise[i];
        const absVal = Math.abs(diffNoise[i]);
        if (absVal > maxAbs) maxAbs = absVal;
      }

      for (let i = 0; i < totalSamples; i++) {
        diffNoise[i] /= maxAbs;
      }

      const chunk = Math.floor(sampleRate * 0.22);
      for (let i = 0; i < totalSamples; i += chunk) {
        const chunkEnd = Math.min(i + chunk, totalSamples);
        const vol = 0.5 + Math.random() * 0.5;
        const pauseStart = i + Math.floor((chunkEnd - i) * 0.82);

        for (let j = i; j < chunkEnd; j++) {
          diffNoise[j] *= vol;
          if (j >= pauseStart) {
            diffNoise[j] *= 0.12;
          }
        }
      }

      const fadeSamples = Math.floor(sampleRate * 0.015);
      for (let i = 0; i < totalSamples; i++) {
        let env = 1.0;
        if (i < fadeSamples) env = i / fadeSamples;
        else if (i > totalSamples - fadeSamples) env = (totalSamples - i) / fadeSamples;
        channelData[i] = diffNoise[i] * env * 0.36;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.6, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.8, this.ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      source.start();
    } catch (e) {
      console.warn('Page flip sound error:', e);
    }
  }

  /**
   * Sound effect for opening the luxury book
   */
  public playBookOpen() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.38);

      oscGain.gain.setValueAtTime(this.volume * 0.22, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);

      this.playPageFlip(0.9);
    } catch (e) {
      console.warn('Book open sound error:', e);
    }
  }

  /**
   * Golden shimmer chime for milestone or rating submit
   */
  public playGoldenChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880.0, 1174.66];

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(this.volume * 0.15, now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.3);
      });
    } catch (e) {
      console.warn('Chime sound error:', e);
    }
  }
}

export const audioEngine = new AudioEngine();
