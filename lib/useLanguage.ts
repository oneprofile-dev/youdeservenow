"use client";

import { useState, useEffect } from "react";
import { SUPPORTED_LANGS, type Lang } from "./i18n";

export function detectLanguage(): Lang {
  if (typeof navigator === "undefined") return "en";
  const l = navigator.language.toLowerCase();
  if (l.startsWith("zh")) return "zh";
  if (l.startsWith("es")) return "es";
  if (l.startsWith("pt")) return "pt";
  if (l.startsWith("fr")) return "fr";
  if (l.startsWith("de")) return "de";
  if (l.startsWith("hi")) return "hi";
  if (l.startsWith("ja")) return "ja";
  if (l.startsWith("ar")) return "ar";
  if (l.startsWith("ko")) return "ko";
  return "en";
}

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ydnLang") as Lang | null;
      setLangState(stored && (SUPPORTED_LANGS as readonly string[]).includes(stored) ? stored : detectLanguage());
    } catch {
      setLangState(detectLanguage());
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("ydnLang", l); } catch { /* ignore */ }
  }

  return { lang, setLang };
}
