import * as path from "path";
import * as fs from "fs";
import {
  parsePo,
  resolveLocale,
  availableLocales,
  setupI18n,
  setCatalog,
  getLocale,
  _,
} from "../src/i18n";

const { extract, buildPot } = require("../scripts/i18n-extract.js");

const localesDir = path.join(__dirname, "..", "src", "locales");
const potFile = path.join(localesDir, "hotfolder.pot");
const locales = availableLocales(localesDir);

describe("parsePo", () => {
  test("parses simple, multi-line, escaped and context entries", () => {
    const po = [
      'msgid ""',
      'msgstr ""',
      '"Language: ja_JP\\n"',
      "",
      'msgid "Hello"',
      'msgstr "こんにちは"',
      "",
      'msgid ""',
      '"Multi "',
      '"line"',
      'msgstr ""',
      '"複数"',
      '"行"',
      "",
      'msgid "Path a\\\\b \\"q\\""',
      'msgstr "パス a\\\\b \\"q\\""',
      "",
      'msgctxt "menu"',
      'msgid "Open"',
      'msgstr "開く"',
      "",
      "#, fuzzy",
      'msgid "Fuzzy"',
      'msgstr "あいまい"',
      "",
      'msgid "Untranslated"',
      'msgstr ""',
    ].join("\r\n");
    const c = parsePo(po);
    expect(c["Hello"]).toBe("こんにちは");
    expect(c["Multi line"]).toBe("複数行");
    expect(c['Path a\\b "q"']).toBe('パス a\\b "q"');
    expect(c["menu\u0004Open"]).toBe("開く");
    expect(c["Fuzzy"]).toBeUndefined();
    expect(c["Untranslated"]).toBeUndefined();
    expect(c[""]).toBeUndefined();
  });
});

describe("resolveLocale", () => {
  const available = ["ja_JP", "zh_CN", "zh_TW", "pt_BR", "de_DE"];
  test.each([
    ["ja_JP", "ja_JP"],
    ["zh_TW", "zh_TW"],
    ["zh_CN", "zh_CN"],
    ["pt_PT", "pt_BR"],
    ["de_AT", "de_DE"],
    ["de", "de_DE"],
    ["ja-JP", "ja_JP"],
    ["en_US", null],
    ["en_GB", null],
    ["sv_SE", null],
    ["", null],
  ])("%s -> %s", (input, expected) => {
    expect(resolveLocale(input, available)).toBe(expected);
  });
});

describe("_()", () => {
  afterAll(() => setCatalog({}, "en_US"));

  test("falls back to msgid and replaces %s in order", () => {
    setCatalog({});
    expect(_("Notebook `%s` of %s", "A", 2)).toBe("Notebook `A` of 2");
  });

  test("uses translation", () => {
    setCatalog({ "Log level for the log file %s": "ログファイル %s" });
    expect(_("Log level for the log file %s", "x.log")).toBe(
      "ログファイル x.log"
    );
  });
});

describe("setupI18n", () => {
  afterAll(() => setCatalog({}, "en_US"));

  test("loads Japanese", () => {
    expect(setupI18n(localesDir, "ja_JP")).toBe("ja_JP");
    expect(getLocale()).toBe("ja_JP");
    expect(_("Hotfolder Path")).toBe("ホットフォルダーのパス");
    expect(
      _(
        "If no notebook is specified, the import is made to the current notebook. Subnotebooks can be defined via Project\\Scans"
      )
    ).toContain("Project\\Scans");
  });

  test("English and unknown locales use msgid", () => {
    expect(setupI18n(localesDir, "en_US")).toBe("en_US");
    expect(_("Hotfolder Path")).toBe("Hotfolder Path");
    expect(setupI18n(localesDir, "xx_XX")).toBe("en_US");
    expect(_("Hotfolder Path")).toBe("Hotfolder Path");
  });

  test("missing directory falls back to English", () => {
    expect(setupI18n(path.join(localesDir, "nope"), "ja_JP")).toBe("en_US");
  });
});

describe("translation files", () => {
  const potIds = Object.keys(
    // Parse POT by treating msgid as its own translation
    parsePo(
      fs
        .readFileSync(potFile, "utf8")
        .replace(/msgid "(.*)"\r?\nmsgstr ""/g, 'msgid "$1"\nmsgstr "$1"')
    )
  );

  test("POT is up to date with source (run npm run i18n:extract)", () => {
    const expected = buildPot(extract());
    expect(fs.readFileSync(potFile, "utf8").replace(/\r\n/g, "\n")).toBe(
      expected
    );
  });

  test("expected locales exist", () => {
    expect(locales.sort()).toEqual(
      [
        "de_DE",
        "es_ES",
        "fr_FR",
        "hr_HR",
        "it_IT",
        "ja_JP",
        "ko_KR",
        "nl_NL",
        "pl_PL",
        "pt_BR",
        "ru_RU",
        "zh_CN",
        "zh_TW",
      ].sort()
    );
  });

  test.each(locales)("%s translates every message with matching %%s", (l) => {
    const catalog = parsePo(
      fs.readFileSync(path.join(localesDir, l + ".po"), "utf8")
    );
    expect(potIds.length).toBeGreaterThan(0);
    for (const id of potIds) {
      expect([l, id, catalog[id] !== undefined]).toEqual([l, id, true]);
      const count = (s: string) => (s.match(/%s/g) || []).length;
      expect([l, id, count(catalog[id])]).toEqual([l, id, count(id)]);
    }
    // No obsolete entries
    for (const id of Object.keys(catalog)) {
      expect([l, id, potIds.includes(id)]).toEqual([l, id, true]);
    }
  });
});
