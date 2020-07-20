import * as vscode from "vscode";
import { ISetting, isPathExists } from "../extension";
import { RelevantListProvider } from "./relevant_list_provider";
import * as fs from "fs";

export function initRelevantListProvider() {
  let fileNameToSettingMap: { [key: string]: ISetting };
  const settingUri = vscode.Uri.file(
    vscode.workspace.rootPath + "/.vscodefilememorc.json"
  );
  if (isPathExists(settingUri.fsPath)) {
    const settings: ISetting[] = JSON.parse(
      fs.readFileSync(settingUri.fsPath, "utf8")
    );
    if (settings.length > 0) {
      fileNameToSettingMap = convertSettingForTreeDataProvider_(settings);
      vscode.window.registerTreeDataProvider(
        "vscodeFileMemoMemoList",
        new RelevantListProvider(fileNameToSettingMap)
      );
    }
  }
}

function convertSettingForTreeDataProvider_(
  settings: ISetting[]
): { [key: string]: ISetting } {
  return settings.reduce((map: { [key: string]: ISetting }, obj) => {
    map[obj.fileName] = obj;
    return map;
  }, {});
}
