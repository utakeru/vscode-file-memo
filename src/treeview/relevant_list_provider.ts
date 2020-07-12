import * as vscode from "vscode";
import { ISetting } from "../extension";
export class RelevantListProvider
  implements vscode.TreeDataProvider<RelevantFile> {
  settings: { [key: string]: ISetting } = {};

  constructor(settings: { [key: string]: ISetting }) {
    this.settings = settings;
  }

  onDidChangeTreeData?:
    | vscode.Event<void | RelevantFile | null | undefined>
    | undefined;

  getTreeItem(element: RelevantFile): RelevantFile {
    return element;
  }

  getChildren(element?: RelevantFile): RelevantFile[] {
    if (element) {
      return element.memoPaths.map((memoPath) => {
        const label = memoPath.replace(/^.*[\\\/]/, "");
        return new RelevantFile(
          label,
          memoPath,
          [],
          "memoFile",
          vscode.TreeItemCollapsibleState.None
        );
      });
    }
    const workspaceRootPath = vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.path
      : "";
    return Object.entries(this.settings).map(([, value]) => {
      // 最後のスラッシュも取り除きたいので +1
      const label = value.fileName.substr(workspaceRootPath.length + 1);
      return new RelevantFile(
        label,
        value.fileName,
        value.memoFilePaths,
        "targetFile",
        vscode.TreeItemCollapsibleState.Expanded
      );
    });
  }
}

export class RelevantFile extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly path: string,
    public readonly memoPaths: string[],
    public readonly context: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    return this.path;
  }

  get description(): string {
    return this.path;
  }

  get contextValue(): string {
    return this.context;
  }
}
