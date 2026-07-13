"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeTtsText = (text, lang) => {
  if (!text) return text;
  const normalized = text.normalize("NFC").replace(/\s+/g, " ").trim();
  if (lang && lang.toLowerCase().startsWith("ar")) {
    return `\u200f${normalized}`;
  }
  return normalized;
};

const isExpectedPlaybackInterruption = (error) => {
  const message = (error?.message || "").toLowerCase();
  return (
    error?.name === "AbortError" ||
    message.includes("interrupted") ||
    message.includes("pause")
  );
};

/**
 * Custom hook to handle audio playback with fallback to Text-to-Speech (TTS).
 * Prioritizes pre-recorded MP3 files for accurate pronunciation, falls back to native browser TTS.
 * @returns {Object} - Returns the play, pause, stop functions, playing state, and available voices.
 */
export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const playbackRequestIdRef = useRef(0);

  const [voices, setVoices] = useState([]);

  const refreshVoices = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    }
  }, []);

  useEffect(() => {
    // Initialize standard audio element
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onpause = () => setIsPlaying(false);
    audioRef.current.onplay = () => setIsPlaying(true);

    // Initialize SpeechSynthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        refreshVoices();
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
        if (typeof window !== "undefined") {
          window.speechSynthesis.onvoiceschanged = null;
        }
      }
    };
  }, [refreshVoices]);

  const play = useCallback(
    ({ url, text, lang = "ar-SA", gender, voiceName, rate = 1 }) => {
      const requestId = playbackRequestIdRef.current + 1;
      playbackRequestIdRef.current = requestId;

      // Stop any currently playing audio or speech
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setIsPlaying(false);

      // Prioritize MP3 audio file for accurate pronunciation
      if (url) {
        if (audioRef.current) {
          audioRef.current.src = url;
          // Clamp rate for MP3 to safe range
          const safeRate = clamp(rate, 0.5, 2);
          audioRef.current.playbackRate = safeRate;
          audioRef.current
            .play()
            .catch((e) => {
              if (
                requestId !== playbackRequestIdRef.current ||
                isExpectedPlaybackInterruption(e)
              ) {
                return;
              }
              console.error("Audio play error:", e);
            });
        }
      } else if (text && synthRef.current) {
        // Fallback to TTS (only when no MP3 is provided)
        const isArabic = (lang || "").toLowerCase().startsWith("ar");
        const safeRate = isArabic ? clamp(rate, 0.5, 1.2) : clamp(rate, 0.5, 1.5);
        const ttsText = normalizeTtsText(text, lang);

        const utterance = new SpeechSynthesisUtterance(ttsText);
        utterance.lang = lang;
        utterance.rate = safeRate;
        utterance.pitch = 1;
        utterance.volume = 1;

        const targetLang = (lang || "ar-SA").toLowerCase();
        const baseLang = targetLang.split("-")[0];

        const allVoices =
          voices.length > 0
            ? voices
            : window.speechSynthesis.getVoices() || [];

        const exactLangVoices = allVoices.filter(
          (v) => v.lang && v.lang.toLowerCase() === targetLang
        );
        const baseLangVoices = allVoices.filter(
          (v) => v.lang && v.lang.toLowerCase().startsWith(baseLang)
        );
        const langVoices =
          exactLangVoices.length > 0 ? exactLangVoices : baseLangVoices;

        if (langVoices.length > 0) {
          let pickedVoice = null;

          if (voiceName) {
            pickedVoice = langVoices.find(
              (v) => v.name.toLowerCase() === voiceName.toLowerCase()
            );
          }

          if (!pickedVoice && gender) {
            const maleHints = ["male", "maged", "naayf", "hamed"];
            const femaleHints = [
              "female",
              "laila",
              "zira",
              "zariyah",
              "salma",
              "layla",
            ];

            const lowerName = (v) =>
              `${v.name} ${v.voiceURI || ""}`.toLowerCase();
            const prefersSaudi =
              targetLang === "ar-sa" || targetLang === "ar-sa".toLowerCase();

            if (gender === "male") {
              pickedVoice =
                (prefersSaudi
                  ? langVoices.find((v) => lowerName(v).includes("hamed"))
                  : null) ||
                langVoices.find((v) =>
                  maleHints.some((h) => lowerName(v).includes(h))
                );
            } else if (gender === "female") {
              pickedVoice =
                (prefersSaudi
                  ? langVoices.find((v) => lowerName(v).includes("zariyah"))
                  : null) ||
                langVoices.find((v) =>
                  femaleHints.some((h) => lowerName(v).includes(h))
                );
            }
          }

          utterance.voice = pickedVoice || langVoices[0];
        }

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = (e) => {
          if (e.error === "interrupted") {
            return;
          }
          console.error("TTS error:", e);
          setIsPlaying(false);
        };
        utterance.onstart = () => setIsPlaying(true);

        utteranceRef.current = utterance;
        // Small delay avoids choppy playback right after cancel.
        setTimeout(() => {
          if (synthRef.current) {
            synthRef.current.speak(utterance);
          }
        }, 60);
      } else {
        console.warn("No URL or Text provided for audio playback.");
      }
    },
    [voices]
  );

  const pause = useCallback(() => {
    playbackRequestIdRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (synthRef.current) {
      synthRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    playbackRequestIdRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  }, []);

  return {
    play,
    pause,
    stop,
    isPlaying,
    voices,
    refreshVoices,
  };
};
