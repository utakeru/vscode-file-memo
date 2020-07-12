import * as vscode from "vscode";

import { RelevantFile } from "../treeview/relevant_list_provider";
import { ViewColumn } from "vscode";

export function openFile(arg: RelevantFile) {
  vscode.window.showTextDocument(vscode.Uri.file(arg.path), {
    viewColumn: ViewColumn.Beside,
  });
}
