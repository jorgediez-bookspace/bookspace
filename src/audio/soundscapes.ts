import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { Soundscape } from '../types';

export const SOUNDSCAPES: Soundscape[] = [
  {
    id: 'rainy_cafe',
    name: 'Rainy Cafe',
    subtitle: 'Gentle raindrops & warm bistro calm',
    icon: 'cloud-rain',
    audioUrl: 'https://cdn.freesound.org/previews/568/568444_6142149-lq.mp3',
    fallbackToneFreq: 320,
  },
  {
    id: 'dark_forest_wind',
    name: 'Dark Forest Wind',
    subtitle: 'Whispering pines & night breeze',
    icon: 'wind',
    audioUrl: 'https://cdn.freesound.org/previews/459/459992_6142149-lq.mp3',
    fallbackToneFreq: 180,
  },
  {
    id: 'deep_space_hum',
    name: 'Deep Space Hum',
    subtitle: 'Low-frequency sci-fi cabin drone',
    icon: 'compass',
    audioUrl: 'https://cdn.freesound.org/previews/688/688463_11861866-lq.mp3',
    fallbackToneFreq: 110,
  },
  {
    id: 'crackling_fireplace',
    name: 'Crackling Fireplace',
    subtitle: 'Cozy hearth & crackling embers',
    icon: 'flame',
    audioUrl: 'https://cdn.freesound.org/previews/434/434680_5674468-lq.mp3',
    fallbackToneFreq: 240,
  },
  {
    id: 'midnight_library',
    name: 'Midnight Library',
    subtitle: 'Soft resonance of quiet antique halls',
    icon: 'book-open',
    audioUrl: 'https://cdn.freesound.org/previews/442/442907_6142149-lq.mp3',
    fallbackToneFreq: 150,
  },
];

class AudioManager {
  private sound: Audio.Sound | null = null;
  private currentSoundscapeId: string | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.7;
  private audioModeConfigured: boolean = false;
  private webAudioCtx: any = null;
  private webAudioNodes: any[] = [];

  async initAudioMode() {
    if (this.audioModeConfigured) return;
    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }
      this.audioModeConfigured = true;
    } catch (e) {
      console.warn('[AudioManager] Failed to setAudioModeAsync:', e);
    }
  }

  // Web Audio synthesizer fallback for 100% offline & cross-platform resilience
  private startWebSynthNoise(freq: number) {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    try {
      this.stopWebSynth();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      this.webAudioCtx = new AudioContextClass();
      if (this.webAudioCtx.state === 'suspended') {
        this.webAudioCtx.resume();
      }

      // Generate brown/pink noise buffer
      const bufferSize = this.webAudioCtx.sampleRate * 2;
      const noiseBuffer = this.webAudioCtx.createBuffer(1, bufferSize, this.webAudioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // gain boost
      }

      const whiteNoise = this.webAudioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Low pass filter to shape cozy ambient drone
      const filter = this.webAudioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq || 200, this.webAudioCtx.currentTime);

      const gainNode = this.webAudioCtx.createGain();
      gainNode.gain.setValueAtTime(this.volume * 0.4, this.webAudioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.webAudioCtx.destination);

      whiteNoise.start(0);
      this.webAudioNodes = [whiteNoise, filter, gainNode];
    } catch (err) {
      console.warn('[AudioManager] Web synth fallback failed:', err);
    }
  }

  private stopWebSynth() {
    try {
      if (this.webAudioNodes.length) {
        this.webAudioNodes[0].stop();
        this.webAudioNodes = [];
      }
      if (this.webAudioCtx) {
        this.webAudioCtx.close();
        this.webAudioCtx = null;
      }
    } catch {}
  }

  async playSoundscape(soundscape: Soundscape, volume: number = 0.7): Promise<boolean> {
    await this.initAudioMode();
    this.volume = volume;

    try {
      if (this.sound) {
        await this.sound.stopAsync().catch(() => {});
        await this.sound.unloadAsync().catch(() => {});
        this.sound = null;
      }

      this.currentSoundscapeId = soundscape.id;

      const { sound } = await Audio.Sound.createAsync(
        { uri: soundscape.audioUrl },
        {
          shouldPlay: true,
          isLooping: true,
          volume: this.volume,
        }
      );

      this.sound = sound;
      this.isPlaying = true;
      return true;
    } catch (error) {
      console.warn('[AudioManager] Network stream failed, using procedural ambient fallback:', error);
      // Fallback to web synth if on web
      if (Platform.OS === 'web') {
        this.startWebSynthNoise(soundscape.fallbackToneFreq || 200);
        this.isPlaying = true;
        this.currentSoundscapeId = soundscape.id;
        return true;
      }
      this.isPlaying = false;
      return false;
    }
  }

  async pause() {
    this.isPlaying = false;
    if (this.sound) {
      try {
        await this.sound.pauseAsync();
      } catch (e) {
        console.warn('[AudioManager] pause failed:', e);
      }
    }
    this.stopWebSynth();
  }

  async resume() {
    if (this.sound) {
      try {
        await this.sound.playAsync();
        this.isPlaying = true;
      } catch (e) {
        console.warn('[AudioManager] resume failed:', e);
      }
    } else if (this.currentSoundscapeId) {
      const scape = SOUNDSCAPES.find((s) => s.id === this.currentSoundscapeId);
      if (scape) {
        await this.playSoundscape(scape, this.volume);
      }
    }
  }

  async setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(this.volume);
      } catch (e) {
        console.warn('[AudioManager] setVolume failed:', e);
      }
    }
    if (this.webAudioNodes[2]) {
      this.webAudioNodes[2].gain.setValueAtTime(this.volume * 0.4, this.webAudioCtx?.currentTime || 0);
    }
  }

  async stop() {
    this.isPlaying = false;
    this.currentSoundscapeId = null;
    if (this.sound) {
      try {
        await this.sound.stopAsync().catch(() => {});
        await this.sound.unloadAsync().catch(() => {});
      } catch {}
      this.sound = null;
    }
    this.stopWebSynth();
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getCurrentSoundscapeId() {
    return this.currentSoundscapeId;
  }

  getVolume() {
    return this.volume;
  }
}

export const audioManager = new AudioManager();
