import * as vscode from "vscode";
import { NodeDependenciesProvider } from "./treeview/node_dependencies_provider";
import { RelevantListProvider, RelevantFile } from "./treeview/relevant_list_provider";
import { ViewColumn } from "vscode";

export interface ISetting {
  fileName: string;
  memoFilePaths: string[];
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "jarvis" is now active!');
  let fileNameToSettingMap: { [key: string]: ISetting };
  const uri = vscode.Uri.file(vscode.workspace.rootPath + "/.jarvisrc.json");
  vscode.workspace.openTextDocument(uri).then((doc) => {
    const settings: ISetting[] = JSON.parse(doc.getText());
    fileNameToSettingMap = settings.reduce(
      (map: { [key: string]: ISetting }, obj) => {
        map[obj.fileName] = obj;
        return map;
      },
      {}
    );

    vscode.window.registerTreeDataProvider(
      "jarvisRelevantList",
      new RelevantListProvider(fileNameToSettingMap)
    );
  });

  context.subscriptions.push(
    vscode.commands.registerCommand("jarvis.helloWorld", () => {
      vscode.window.showWarningMessage("Hello VS Code from jarvis!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("jarvis.getRelevantFiles", () => {
      if (
        vscode.window.activeTextEditor &&
        fileNameToSettingMap[vscode.window.activeTextEditor?.document.fileName]
      ) {
        vscode.window.registerTreeDataProvider(
          "jarvisRelevantList",
          new RelevantListProvider(fileNameToSettingMap)
        );
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("jarvis.openFile", (arg: RelevantFile) => {
      if (vscode.window.activeTextEditor) {
          vscode.window.showTextDocument(vscode.Uri.file(arg.path), { viewColumn: ViewColumn.Beside });
        } else {
          vscode.window.showErrorMessage(
            "ファイルがありませんでした。:" + arg.label
          );
        }
      }
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
