import joplin from "api";
import { SettingItem, SettingItemType, SettingItemSubType } from "api/types";
import { helper } from "./helper";
import { _ } from "./i18n";
import { hotfolderSettings } from "./type";

export namespace settings {
  export async function register(logFile: string) {
    let hotfolderNr = 0;
    const settingsObject: Record<string, SettingItem> = {};
    const joplinVersionInfo = await helper.joplinVersionInfo();

    do {
      await joplin.settings.registerSection(
        "hotfolderSection" + (hotfolderNr == 0 ? "" : hotfolderNr),
        {
          label:
            _("Hotfolder i18n") +
            (hotfolderNr == 0 ? "" : " " + (hotfolderNr + 1).toString()),
          iconName: "fas fa-eye",
        }
      );

      settingsObject["hotfolderPath" + (hotfolderNr == 0 ? "" : hotfolderNr)] =
        {
          value: "",
          type: SettingItemType.String,
          section: "hotfolderSection" + (hotfolderNr == 0 ? "" : hotfolderNr),
          public: true,
          label: _("Hotfolder Path"),
          description: _("Folder from which the files should be imported"),
        };
      // Add DirectoryPath selector for newer Joplin versions
      if (
        joplinVersionInfo !== null &&
        (await helper.versionCompare(joplinVersionInfo.version, "2.10.4")) >= 0
      ) {
        settingsObject["hotfolderPath" + (hotfolderNr == 0 ? "" : hotfolderNr)][
          "subType"
        ] = SettingItemSubType.DirectoryPath;
      }

      settingsObject["ignoreFiles" + (hotfolderNr == 0 ? "" : hotfolderNr)] = {
        value: ".*",
        type: SettingItemType.String,
        section: "hotfolderSection" + (hotfolderNr == 0 ? "" : hotfolderNr),
        public: true,
        label: _("Ignore Files"),
        description: _("Comma separated list of files which will be ignored"),
      };

      settingsObject[
        "extensionsAddAsText" + (hotfolderNr == 0 ? "" : hotfolderNr)
      ] = {
        value: ".txt, .md",
        type: SettingItemType.String,
        section: "hotfolderSection" + (hotfolderNr == 0 ? "" : hotfolderNr),
        public: true,
        label: _("Add as text"),
        description: _(
          "Comma separated list of file extensions, which will be imported as text"
        ),
      };

      settingsObject[
        "extensionsAddTextAsTodo" + (hotfolderNr == 0 ? "" : hotfolderNr)
      ] = {
        value: false,
        type: SettingItemType.Bool,
        section: "hotfolderSection" + (hotfolderNr == 0 ? "" : hotfolderNr),
        public: true,
        label: _("Add text notes as Todo"),
        description: _(
          "Text only notes will be imported as Todo type notes, all other file types will be imported as attachments in regular notes"
        ),
      };

      settingsObject["importNotebook" + (hotfolderNr == 0 ? "" : hotfolderNr)] =
        {
          value: "",
          type: SettingItemType.String,
          section: "hotfolderSection" + (hotfolderNr == 0 ? "" : hotfolderNr),
          public: true,
          label: _("Notebook"),
          description: _(
            "If no notebook is specified, the import is made to the current notebook. Subnotebooks can be defined via Project\\Scans"
          ),
        };

      settingsObject["importTags" + (hotfolderNr == 0 ? "" : hotfolderNr)] = {
        value: "",
        type: SettingItemType.String,
        section: "hotfolderSection" + (hotfolderNr == 0 ? "" : hotfolderNr),
        public: true,
        label: _("Tags"),
        description: _("Comma separated list of tags to be added to the note"),
      };

      settingsObject[
        "intervallFileFinished" + (hotfolderNr == 0 ? "" : hotfolderNr)
      ] = {
        value: 2,
        minimum: 1,
        maximum: 120,
        type: SettingItemType.Int,
        section: "hotfolderSection" + (hotfolderNr == 0 ? "" : hotfolderNr),
        public: true,
        advanced: true,
        label: _("File ready"),
        description: _(
          "Every how many seconds should be checked whether the file in the hotfolder is ready (Checks the file size and file lock additionally)"
        ),
      };

      settingsObject["usePolling" + (hotfolderNr == 0 ? "" : hotfolderNr)] = {
        value: false,
        type: SettingItemType.Bool,
        section: "hotfolderSection" + (hotfolderNr == 0 ? "" : hotfolderNr),
        public: true,
        advanced: true,
        label: _("Polling"),
        description: _(
          "May be necessary for Hotfolders in the network. Leads to a slightly higher system load"
        ),
      };

      settingsObject[
        "pollingIntervall" + (hotfolderNr == 0 ? "" : hotfolderNr)
      ] = {
        value: 100,
        minimum: 100,
        type: SettingItemType.Int,
        section: "hotfolderSection" + (hotfolderNr == 0 ? "" : hotfolderNr),
        public: true,
        advanced: true,
        label: _("Polling intervall"),
        description: _("Interval in milliseconds for querying the hotfolder"),
      };

      settingsObject["depth" + (hotfolderNr == 0 ? "" : hotfolderNr)] = {
        value: 0,
        minimum: 0,
        maximum: 10,
        type: SettingItemType.Int,
        section: "hotfolderSection" + (hotfolderNr == 0 ? "" : hotfolderNr),
        public: true,
        advanced: true,
        label: _("Depth"),
        description: _(
          "How many subdirectories will be checked for file import"
        ),
      };

      if (hotfolderNr === 0) {
        await joplin.settings.registerSettings({
          hotfolderAnz: {
            value: 1,
            minimum: 1,
            maximum: 10,
            type: SettingItemType.Int,
            section: "hotfolderSection",
            public: true,
            label: _("Number of Hotfolders"),
            description: _(
              "Additional Hotfolder Sections appear on the left (Please restart Joplin after a change)"
            ),
          },
          fileLogLevel: {
            value: "error",
            type: SettingItemType.String,
            section: "hotfolderSection",
            isEnum: true,
            public: true,
            advanced: true,
            label: _("Loglevel"),
            description: _("Log level for the log file %s", logFile),
            options: {
              false: _("Off"),
              verbose: _("Verbose"),
              info: _("Info"),
              warn: _("Warning"),
              error: _("Error"),
            },
          },
        });
      }

      hotfolderNr++;
    } while (hotfolderNr < (await joplin.settings.value("hotfolderAnz")));

    await joplin.settings.registerSettings(settingsObject);
  }

  export async function getHotfolder(
    hotfolderNr: number
  ): Promise<hotfolderSettings> {
    let hotfolderNrStr = "";
    if (hotfolderNr != 0) {
      hotfolderNrStr = String(hotfolderNr);
    }
    const ignoreFiles = await joplin.settings.value(
      "ignoreFiles" + hotfolderNrStr
    );

    const extensionsAddAsText = await joplin.settings.value(
      "extensionsAddAsText" + hotfolderNrStr
    );

    const extensionsAddTextAsTodo = await joplin.settings.value(
      "extensionsAddTextAsTodo" + hotfolderNrStr
    );

    const selectedFolder = await joplin.workspace.selectedFolder();
    const importNotebook = await joplin.settings.value(
      "importNotebook" + hotfolderNrStr
    );
    let notebookId = await helper.getNotebookId(importNotebook, false);
    if (notebookId == null) {
      notebookId = selectedFolder.id;
    }

    const importTags = await joplin.settings.value(
      "importTags" + hotfolderNrStr
    );

    let intervallFileFinished = await joplin.settings.value(
      "intervallFileFinished" + hotfolderNrStr
    );
    // Fix old value, where 0 was possible
    if (intervallFileFinished < 1) {
      intervallFileFinished = 2;
      await joplin.settings.setValue(
        "intervallFileFinished" + hotfolderNrStr,
        intervallFileFinished
      );
    }

    const usePolling = await joplin.settings.value(
      "usePolling" + hotfolderNrStr
    );

    const pollingIntervall = await joplin.settings.value(
      "pollingIntervall" + hotfolderNrStr
    );

    const depth = await joplin.settings.value("depth" + hotfolderNrStr);

    return {
      notebookId: notebookId,
      importTags: importTags,
      extensionsAddAsText: extensionsAddAsText,
      ignoreFiles: ignoreFiles,
      textAsTodo: extensionsAddTextAsTodo,
      importNotebook: importNotebook,
      usePolling: usePolling,
      pollingIntervall: pollingIntervall,
      intervallFileFinished: intervallFileFinished,
      depth: depth,
    };
  }
}
