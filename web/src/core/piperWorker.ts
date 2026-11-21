/// <reference lib="webworker" />
import { loadVoice, setEngineBase, speech, type VoiceTune } from './piperEngine';

/** Calcul de la voix du dino, à l'écart de la page (l'animation reste fluide). */
self.onmessage = async (e: MessageEvent<{ id: number; kind: 'load' | 'speech'; voiceId: string; text?: string; slow?: boolean; tune?: VoiceTune; base: string }>) => {
  const { id, kind, voiceId, text, slow, tune, base } = e.data;
  setEngineBase(base);
  try {
    if (kind === 'load') {
      await loadVoice(voiceId);
      self.postMessage({ id, ok: true });
    } else {
      const out = await speech(voiceId, text ?? '', !!slow, tune);
      (self as unknown as Worker).postMessage({ id, ok: true, pcm: out.pcm, sampleRate: out.sampleRate }, [out.pcm.buffer]);
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
