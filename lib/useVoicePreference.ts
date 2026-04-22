"use client";

import { useCallback, useEffect, useState } from "react";
import type { PromptVoice } from "@/lib/prompt";

const STORAGE_KEY = "ydn_voice";

/**
 * Persisted Institute vs warm tone (localStorage). Defaults to classic until hydrated.
 */
export function useVoicePreference(): [PromptVoice, (v: PromptVoice) => void] {
  const [voice, setVoiceState] = useState<PromptVoice>("classic");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "warm" || raw === "classic") {
        setVoiceState(raw);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setVoice = useCallback((v: PromptVoice) => {
    setVoiceState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  return [voice, setVoice];
}
