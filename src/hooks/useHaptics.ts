import { useCallback, useRef } from "react";
// Standalone: only React is required. Audio is initialized inside the user gesture.
let context: AudioContext | undefined;
let last = -Infinity;
let voices = 0;
export function canPlay(now: number, previous: number, active: number) {
  return now - previous >= 30 && active < 6;
}
export function useHaptics(muted = true, volume = 0.35, tone = 220) {
  // Timers can retain this callback; always consult the latest preferences.
  const settings = useRef({ muted, volume, tone });
  settings.current = { muted, volume, tone };
  return useCallback(async () => {
    if (
      settings.current.muted ||
      settings.current.volume <= 0 ||
      !canPlay(performance.now(), last, voices)
    )
      return;
    last = performance.now();
    const Audio =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Audio) return;
    try {
      context ??= new Audio();
      if (context.state === "suspended") await context.resume();
      if (
        context.state !== "running" ||
        voices >= 6 ||
        settings.current.muted ||
        settings.current.volume <= 0
      )
        return;
      const { volume, tone } = settings.current;
      const now = context.currentTime;
      voices++;
      const body = context.createOscillator(),
        gain = context.createGain();
      body.frequency.setValueAtTime(tone, now);
      body.frequency.exponentialRampToValueAtTime(tone * 0.55, now + 0.027);
      gain.gain.setValueAtTime(Math.max(0.0001, volume * 0.25), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
      body.connect(gain).connect(context.destination);
      body.start(now);
      body.stop(now + 0.032);
      body.onended = () => {
        voices--;
        body.disconnect();
        gain.disconnect();
      };
      const tick = context.createOscillator(),
        tap = context.createGain();
      tick.frequency.value = 3000;
      tap.gain.setValueAtTime(Math.max(0.0001, volume * 0.05), now);
      tap.gain.exponentialRampToValueAtTime(0.0001, now + 0.004);
      tick.connect(tap).connect(context.destination);
      tick.start(now);
      tick.stop(now + 0.005);
      tick.onended = () => {
        tick.disconnect();
        tap.disconnect();
      };
      if (navigator.vibrate) navigator.vibrate(8);
    } catch {
      /* Audio is optional when browser or device policies block playback. */
    }
  }, []);
}
