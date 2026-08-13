"use client";

import type { HistoryEntry, Settings, ThemePreference } from "./types";

const KEYS = {
  favorites: "calcflow.favorites.v1",
  history: "calcflow.history.v1",
  settings: "calcflow.settings.v1",
  recentSearches: "calcflow.recentSearches.v1",
} as const;

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  currency: "USD",
  locale: "en-US",
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable - fail silently, app still works in-memory for this render
  }
}

/* ---------------- Favorites ---------------- */

export function getFavorites(): string[] {
  return readJson<string[]>(KEYS.favorites, []);
}

export function isFavorite(slug: string): boolean {
  return getFavorites().includes(slug);
}

export function toggleFavorite(slug: string): string[] {
  const current = getFavorites();
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug];
  writeJson(KEYS.favorites, next);
  window.dispatchEvent(new CustomEvent("calcflow:favorites-changed"));
  return next;
}

export function reorderFavorites(next: string[]): void {
  writeJson(KEYS.favorites, next);
  window.dispatchEvent(new CustomEvent("calcflow:favorites-changed"));
}

/* ---------------- History ---------------- */

const MAX_HISTORY = 100;

export function getHistory(): HistoryEntry[] {
  return readJson<HistoryEntry[]>(KEYS.history, []);
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: `${entry.slug}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };
  const current = getHistory();
  const next = [full, ...current].slice(0, MAX_HISTORY);
  writeJson(KEYS.history, next);
  window.dispatchEvent(new CustomEvent("calcflow:history-changed"));
  return full;
}

export function deleteHistoryEntry(id: string): void {
  const next = getHistory().filter((h) => h.id !== id);
  writeJson(KEYS.history, next);
  window.dispatchEvent(new CustomEvent("calcflow:history-changed"));
}

export function clearHistory(): void {
  writeJson(KEYS.history, []);
  window.dispatchEvent(new CustomEvent("calcflow:history-changed"));
}

/* ---------------- Recent searches ---------------- */

const MAX_RECENT_SEARCHES = 8;

export function getRecentSearches(): string[] {
  return readJson<string[]>(KEYS.recentSearches, []);
}

export function addRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  const current = getRecentSearches().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
  const next = [trimmed, ...current].slice(0, MAX_RECENT_SEARCHES);
  writeJson(KEYS.recentSearches, next);
}

export function clearRecentSearches(): void {
  writeJson(KEYS.recentSearches, []);
}

/* ---------------- Settings ---------------- */

export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...readJson<Partial<Settings>>(KEYS.settings, {}) };
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const next = { ...getSettings(), ...patch };
  writeJson(KEYS.settings, next);
  window.dispatchEvent(new CustomEvent("calcflow:settings-changed"));
  return next;
}

export function getThemePreference(): ThemePreference {
  return getSettings().theme;
}

export function setThemePreference(theme: ThemePreference): void {
  updateSettings({ theme });
}
