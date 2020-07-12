import * as vscode from "vscode";
import {
  RelevantListProvider,
  RelevantFile,
} from "./treeview/relevant_list_provider";
import { ViewColumn } from "vscode";
import * as fs from "fs";

export interface ISetting {
  fileName: string;
  memoFilePaths: string[];
}

export function activate(context: vscode.ExtensionContext) {
  let fileNameToSettingMap: { [key: string]: ISetting };
  const uri = vscode.Uri.file(
    vscode.workspace.rootPath + "/.vscodefilememorc.json"
  );
  vscode.workspace.openTextDocument(uri).then((doc) => {
    const settings: ISetting[] =
      doc.getText() === "" ? [] : JSON.parse(doc.getText());
    if (settings.length > 0) {
      fileNameToSettingMap = settings.reduce(
        (map: { [key: string]: ISetting }, obj) => {
          map[obj.fileName] = obj;
          return map;
        },
        {}
      );
    }

    vscode.window.registerTreeDataProvider(
      "vscodeFileMemoMemoList",
      new RelevantListProvider(fileNameToSettingMap)
    );
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("vscodeFileMemo.registerMemoFile", () => {
      const options: vscode.OpenDialogOptions = {
        canSelectMany: true,
        openLabel: "Open",
      };

      vscode.window.showOpenDialog(options).then((fileUris) => {
        if (fileUris && fileUris[0]) {
          console.log("Selected file: " + fileUris[0].fsPath);
        }
        // 設定取得
        const uri = vscode.Uri.file(
          vscode.workspace.rootPath + "/.vscodefilememorc.json"
        );
        vscode.workspace.openTextDocument(uri).then((doc) => {
          const settings: ISetting[] =
            doc.getText() === "" ? [] : JSON.parse(doc.getText());
          const currentFileName =
            vscode.window.activeTextEditor?.document.fileName ?? "";
          const settingIndex = settings.findIndex(
            (setting) => setting.fileName === currentFileName
          );
          const setting = settings[settingIndex];
          if (setting && fileUris) {
            const currentMemoFilePaths = setting.memoFilePaths;
            const fileUriPaths = fileUris.map((fileUri) => {
              return fileUri.fsPath;
            });
            const newMemoFilePaths = currentMemoFilePaths.concat(fileUriPaths);
            settings[settingIndex].memoFilePaths = newMemoFilePaths;
          } else {
            settings.push({
              fileName: currentFileName,
              memoFilePaths: [],
            });
          }
          // 設定ファイルを保存
          fs.writeFileSync(
            vscode.workspace.rootPath + "/.vscodefilememorc.json",
            JSON.stringify(settings)
          );
          vscode.window.showInformationMessage(".vscodefilememorc.json saved");
        });
      });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscodeFileMemo.openFile",
      (arg: RelevantFile) => {
        vscode.window.showTextDocument(vscode.Uri.file(arg.path), {
          viewColumn: ViewColumn.Beside,
        });
      }
    )
  );
}

export function deactivate() {}
