/**
 * Professional Web Audio API Synthesizer for high-quality, low-latency interactive UI sounds.
 * Avoids loading external files and assets, guaranteeing instant playback.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  // Resume if suspended (browsers auto-suspend AudioContext until user interaction)
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  
  return audioCtx;
}

/**
 * Plays a discrete, mechanical, high-end click sound.
 * Excellent for tactile tactile control/button hover or click feedback.
 */
export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Create oscillator and gain envelope
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    // Instantly sweep frequency downward for an organic transient tap
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
    
    // Ultra-snappy envelope
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.06);
  } catch (error) {
    console.warn("UI click audio playback skipped:", error);
  }
}

/**
 * Plays a luxurious, ascending dual-tone digital chime.
 * Excellent for celebrating task/report completion, score upgrades, or roadmap ready events.
 */
export function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // We play a lovely, harmonious chord (E5 then B5 with high harmonics)
    const playNote = (frequency: number, delay: number, duration: number, volume: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, now + delay);
      
      // Filter for analog warmth
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, now + delay);
      filter.frequency.exponentialRampToValueAtTime(800, now + delay + duration);
      
      // Beautiful smooth envelope (fade in, peak, then gradual decay)
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(volume, now + delay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + duration + 0.1);
    };

    // Uplifting micro-arpeggio: E5 (659.25Hz) followed by A5 (880.00Hz) then C#6 (1109.73Hz)
    playNote(659.25, 0.0, 0.4, 0.06);
    playNote(880.00, 0.08, 0.5, 0.05);
    playNote(1109.73, 0.16, 0.7, 0.05);
    
  } catch (error) {
    console.warn("UI success celebration audio playback skipped:", error);
  }
}
