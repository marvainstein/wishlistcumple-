import { useCallback, useEffect, useRef, useState } from 'react';
import { MUSIC_SRC } from '../config';

/**
 * Música de fondo. Los navegadores solo dejan reproducir sonido después de que
 * la persona toca algo, por eso play() se llama desde el botón "¡entrar!".
 */
export function useMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [available, setAvailable] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.src = MUSIC_SRC;
    audio.loop = true;
    audio.volume = 0.55;
    audio.preload = 'auto';
    const ok = () => setAvailable(true);
    const fail = () => setAvailable(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('canplay', ok);
    audio.addEventListener('error', fail);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeEventListener('canplay', ok);
      audio.removeEventListener('error', fail);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audioRef.current = null;
    };
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => setPlaying(false));
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setPlaying(false));
    else a.pause();
  }, []);

  return { available, playing, play, toggle };
}

export type Music = ReturnType<typeof useMusic>;
