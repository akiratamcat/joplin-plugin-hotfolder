<!-- markdownlint-disable MD033 -->
<!-- markdownlint-disable MD028 -->
<!-- markdownlint-disable MD007 -->
<!-- markdownlint-disable MD045 -->

# Joplin Plugin: Hotfolder <img src="img/icon_32.png">

A plugin to Monitor a locale folder and import the files as a new note.

> **Hotfolder i18n — unofficial test build**
>
> This fork is a personal test build of [JackGruber/joplin-plugin-hotfolder](https://github.com/JackGruber/joplin-plugin-hotfolder) with gettext (`.po`) based UI translation.
> It is not an official release and is not affiliated with the original author.
>
> - Plugin ID: `io.github.jackgruber.hotfolder.i18n` / Name: `Hotfolder i18n` (can be installed alongside the original)
> - The UI language follows Joplin's language setting automatically (`Tools > Options > General > Language`).
> - Languages: English, Japanese, Chinese (Simplified / Traditional), Korean, German, Croatian, French, Spanish, Italian, Portuguese (Brazil), Russian, Dutch, Polish
> - Translations other than the existing German and Croatian ones were machine-generated and have not been reviewed by native speakers.
> - Do not enable this plugin and the original plugin for the same folder at the same time, otherwise files may be imported twice.
> - Download: [Releases](https://github.com/akiratamcat/joplin-plugin-hotfolder/releases)
>
> **Hotfolder i18n — 非公式テスト版**
>
> このフォークは、[JackGruber/joplin-plugin-hotfolder](https://github.com/JackGruber/joplin-plugin-hotfolder) を gettext（`.po`）で UI 翻訳した個人のテスト版です。
> 公式リリースではなく、原作者とは関係ありません。
>
> - プラグイン ID: `io.github.jackgruber.hotfolder.i18n`、名前: `Hotfolder i18n`（オリジナルと同時にインストールできます）
> - UI の言語は、Joplin の言語設定（`ツール > オプション > 一般 > 言語`）に合わせて自動で切り替わります。
> - 対応言語: 英語、日本語、中国語（簡体字・繁体字）、韓国語、ドイツ語、クロアチア語、フランス語、スペイン語、イタリア語、ポルトガル語（ブラジル）、ロシア語、オランダ語、ポーランド語
> - 既存のドイツ語とクロアチア語以外の訳は機械翻訳で、ネイティブによる確認はしていません。
> - 同じフォルダーに対して、オリジナルのプラグインと同時に有効にしないでください。ファイルが二重に取り込まれる可能性があります。
> - ダウンロード: [Releases](https://github.com/akiratamcat/joplin-plugin-hotfolder/releases)
>
> **Translators / 翻訳者向け:** the template is `src/locales/hotfolder.pot` (regenerate with `npm run i18n:extract`); add or edit `src/locales/<locale>.po`.

<img src="img/main.png">

<!-- prettier-ignore-start -->
<!-- TOC depthfrom:2 orderedlist:false -->

- [Installation](#installation)
    - [Automatic](#automatic)
    - [Manual](#manual)
        - [Manual via file system](#manual-via-file-system)
        - [Manual via file via GUI](#manual-via-file-via-gui)
- [Usage](#usage)
- [Options](#options)
- [Changelog](#changelog)

<!-- /TOC -->
<!-- prettier-ignore-end -->

## Installation

### Automatic

- Go to `Tools > Options > Plugins`
- Search for `Hotfolder`
- Click Install plugin
- Restart Joplin to enable the plugin

### Manual

#### Manual via file system

- Download the latest released JPL package (`io.github.jackgruber.hotfolder.jpl`) from [here](https://github.com/JackGruber/joplin-plugin-hotfolder/releases/latest)
- Close Joplin
- Copy the downloaded JPL package in your profile `plugins` folder
- Start Joplin

#### Manual via file via GUI

- Download the latest released JPL package (`io.github.jackgruber.hotfolder.jpl`) from [here](https://github.com/JackGruber/joplin-plugin-hotfolder/releases/latest)
- Go to `Tools > Options > Plugins`
- Click on the gear wheel and select `Install from file`
- Select the downloaded JPL file
- Restart Joplin

## Usage

First configure the Plugin under `Tools > Options > Hotfolder`!

Each newly created file in the hotfolder is automatically created as a new note.
The files are added as attachments unless the file extension is defined as `Add as text`.
After processing the file are deleted from the hotfolder.

## Options

Go to `Tools > Options > Backup`

## Changelog

See [CHANGELOG.md](CHANGELOG.md)
