import * as vscode from "vscode";
import { ISetting, isPathExists } from "../extension";
import { RelevantListProvider } from "./relevant_list_provider";

export function initRelevantListProvider() {
  let fileNameToSettingMap: { [key: string]: ISetting };
  const settingUri = vscode.Uri.file(
    vscode.workspace.rootPath + "/.vscodefilememorc.json"
  );
  if (isPathExists(settingUri.fsPath)) {
    vscode.workspace.openTextDocument(settingUri).then((doc) => {
      const settings: ISetting[] =
        doc.getText() === "" ? [] : JSON.parse(doc.getText());
      if (settings.length > 0) {
        fileNameToSettingMap = convertSettingForTreeDataProvider_(settings);
        vscode.window.registerTreeDataProvider(
          "vscodeFileMemoMemoList",
          new RelevantListProvider(fileNameToSettingMap)
        );
      }
    });
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
