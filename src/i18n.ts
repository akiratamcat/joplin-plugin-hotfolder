import * as path from "path";

const fs = require("fs-extra");

/**
 * Minimal gettext (.po) based translation helper.
 *
 * - msgid is the English source text (gettext convention).
 * - The UI language follows the Joplin "locale" setting:
 *   exact match (ja_JP) -> language match (ja_*) -> English (msgid).
 */

export type Catalog = Record<string, string>;

let catalog: Catalog = {};
let activeLocale = "en_US";

function unquote(value: string): string {
  const s = value.trim();
  if (!s.startsWith('"') || !s.endsWith('"')) return "";
  return s.slice(1, -1).replace(/\\(n|t|r|"|\\)/g, (_m, c) => {
    switch (c) {
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      default:
        return c;
    }
  });
}

/**
 * Parse the content of a .po file into a msgid -> msgstr map.
 * Entries with an empty msgstr and fuzzy entries are skipped.
 * msgctxt is supported as "context\u0004msgid".
 */
export function parsePo(content: string): Catalog {
  const result: Catalog = {};
  const lines = content.replace(/^﻿/, "").split(/\r?\n/);

  let ctx: string | null = null;
  let id: string | null = null;
  let str: string | null = null;
  let fuzzy = false;
  let current: "ctx" | "id" | "str" | null = null;

  const flush = () => {
    if (id !== null && id !== "" && str !== null && str !== "" && !fuzzy) {
      result[ctx !== null ? ctx + "\u0004" + id : id] = str;
    }
    ctx = id = str = null;
    fuzzy = false;
    current = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      flush();
      continue;
    }
    if (line.startsWith("#")) {
      if (line.startsWith("#,") && line.includes("fuzzy")) fuzzy = true;
      continue;
    }
    if (line.startsWith("msgctxt ")) {
      if (id !== null) flush();
      ctx = unquote(line.slice(8));
      current = "ctx";
    } else if (line.startsWith("msgid ")) {
      if (id !== null) flush();
      id = unquote(line.slice(6));
      current = "id";
    } else if (line.startsWith("msgstr ")) {
      str = unquote(line.slice(7));
      current = "str";
    } else if (line.startsWith('"')) {
      const part = unquote(line);
      if (current === "ctx") ctx += part;
      else if (current === "id") id += part;
      else if (current === "str") str += part;
    }
  }
  flush();
  return result;
}

/**
 * Pick the best available locale for the given Joplin locale.
 * Returns null when English (the source language) should be used.
 */
export function resolveLocale(
  joplinLocale: string,
  available: string[]
): string | null {
  if (!joplinLocale) return null;
  const normalized = joplinLocale.replace("-", "_");
  const lower = normalized.toLowerCase();

  const exact = available.find((l) => l.toLowerCase() === lower);
  if (exact) return exact;

  const lang = lower.split("_")[0];
  if (lang === "en") return null;
  const sameLang = available.find(
    (l) => l.toLowerCase().split("_")[0] === lang
  );
  return sameLang ?? null;
}

/** List locales (file names without .po) available in a directory. */
export function availableLocales(localesDir: string): string[] {
  try {
    return fs
      .readdirSync(localesDir)
      .filter((f: string) => f.endsWith(".po"))
      .map((f: string) => f.slice(0, -3));
  } catch (e) {
    return [];
  }
}

/**
 * Load the translation for the given Joplin locale.
 * Returns the locale that was loaded (or "en_US" for the source language).
 */
export function setupI18n(localesDir: string, joplinLocale: string): string {
  catalog = {};
  activeLocale = "en_US";
  const locale = resolveLocale(joplinLocale, availableLocales(localesDir));
  if (locale !== null) {
    try {
      const content = fs.readFileSync(
        path.join(localesDir, locale + ".po"),
        "utf8"
      );
      catalog = parsePo(content);
      activeLocale = locale;
    } catch (e) {
      catalog = {};
    }
  }
  return activeLocale;
}

/** Directly set a catalog (used by tests). */
export function setCatalog(newCatalog: Catalog, locale = "test"): void {
  catalog = newCatalog;
  activeLocale = locale;
}

export function getLocale(): string {
  return activeLocale;
}

/** Translate msgid and replace each %s with the given arguments in order. */
export function _(msgid: string, ...args: any[]): string {
  let text = catalog[msgid] ?? msgid;
  let i = 0;
  text = text.replace(/%s/g, () => (i < args.length ? String(args[i++]) : ""));
  return text;
}
