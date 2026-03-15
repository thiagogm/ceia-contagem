import { useState, useEffect, useCallback } from "react";

export type TextSize = "normal" | "grande" | "extra";
export type ContrastMode = "padrao" | "alto";

interface AccessibilitySettings {
  textSize: TextSize;
  contrast: ContrastMode;
  vibration: boolean;
  darkMode: boolean;
}

const STORAGE_KEY = "santa-ceia-accessibility";
const DEFAULTS: AccessibilitySettings = {
  textSize: "normal",
  contrast: "padrao",
  vibration: true,
  darkMode: true,
};

function load(): AccessibilitySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useAccessibilityStore() {
  const [settings, setSettings] = useState<AccessibilitySettings>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.remove("light");
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [settings.darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("text-normal", "text-grande", "text-extra", "high-contrast");
    root.classList.add(`text-${settings.textSize}`);
    if (settings.contrast === "alto") root.classList.add("high-contrast");
  }, [settings.textSize, settings.contrast]);

  const update = useCallback(<K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const triggerHaptic = useCallback((type: "increment" | "decrement" | "action") => {
    if (!settings.vibration || !("vibrate" in navigator)) return;
    switch (type) {
      case "increment":
        navigator.vibrate(25);
        break;
      case "decrement":
        navigator.vibrate([15, 40, 15]);
        break;
      case "action":
        navigator.vibrate(80);
        break;
    }
  }, [settings.vibration]);

  return { settings, update, toggleDarkMode, triggerHaptic };
}
