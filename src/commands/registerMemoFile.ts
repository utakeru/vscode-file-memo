import * as vscode from "vscode";
import * as fs from "fs";
import { ISetting, isPathExists } from "../extension";
import { initRelevantListProvider } from "../treeview/init_tree_view";

export function registerMemoFile() {
  const options: vscode.OpenDialogOptions = {
    canSelectMany: true,
    openLabel: "Open",
  };

  vscode.window.showOpenDialog(options).then((fileUris) => {
    if (!fileUris) {
      return;
    }
    // 設定取得
    const settingUri = vscode.Uri.file(
      vscode.workspace.rootPath + "/.vscodefilememorc.json"
    );

    const selectedTargetFileName =
      vscode.window.activeTextEditor?.document.fileName ?? "";
    makeSettings_(
      settingUri.fsPath,
      selectedTargetFileName,
      fileUris.map((fileUri) => {
        return fileUri.fsPath;
      })
    ).then((settings: ISetting[]) => {
      // 設定ファイルを保存
      fs.writeFileSync(
        vscode.workspace.rootPath + "/.vscodefilememorc.json",
        JSON.stringify(settings)
      );
      vscode.window.showInformationMessage(".vscodefilememorc.json saved");
      initRelevantListProvider();
    });
  });
}

async function makeSettings_(
  settingUriString: string,
  selectedTargetFileName: string,
  fileUriPaths: string[]
): Promise<ISetting[]> {
  if (isPathExists(settingUriString)) {
    // fs でreadしてもいいかも
    return vscode.workspace.openTextDocument(settingUriString).then((doc) => {
      const settings: ISetting[] =
        doc.getText() === "" ? [] : JSON.parse(doc.getText());
      const existingSettingIndex = settings.findIndex(
        (setting) => setting.fileName === selectedTargetFileName
      );
      const existingSetting = settings[existingSettingIndex];
      if (existingSetting) {
        // すでに設定ファイルがある場合は追加する
        const currentMemoFilePaths = existingSetting.memoFilePaths;
        const newMemoFilePaths = currentMemoFilePaths.concat(fileUriPaths);
        settings[existingSettingIndex].memoFilePaths = newMemoFilePaths;
      } else {
        settings.push({
          fileName: selectedTargetFileName,
          memoFilePaths: fileUriPaths,
        });
      }
      return Promise.resolve(settings);
    });
  }
  return Promise.resolve([
    {
      fileName: selectedTargetFileName,
      memoFilePaths: fileUriPaths,
    },
  ]);
}
