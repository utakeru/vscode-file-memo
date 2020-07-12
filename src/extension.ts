import * as vscode from "vscode";
import * as fs from "fs";
import { registerMemoFile } from "./commands/registerMemoFile";
import { initRelevantListProvider } from "./treeview/init_tree_view";
import { openFile } from "./commands/openFile";

export interface ISetting {
  fileName: string;
  memoFilePaths: string[];
}

export function activate(context: vscode.ExtensionContext) {
  initRelevantListProvider();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscodeFileMemo.registerMemoFile",
      registerMemoFile
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vscodeFileMemo.openFile", openFile)
  );
}

export function deactivate() {}

export function isPathExists(path: string): boolean {
  try {
    fs.accessSync(path);
  } catch (err) {
    return false;
  }
  return true;
}
