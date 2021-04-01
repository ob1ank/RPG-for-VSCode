'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    vscode.languages.registerDocumentFormattingEditProvider('rpg', {
        provideDocumentFormattingEdits(document) {
            if (document.lineCount < 1) {
                return [];
            }
            let mark = " * 已格式化标记, 不要删除，也不要在后面加东西!!!";
            if (document.lineAt(document.lineCount - 1).text.search(mark) > -1) {
                return [];
            }
            let strDebug = "\n\n\nDebug 信息:\n";
            let ret = [];
            let indentationDeep = 0;
            let lastLineEndWithAndOr = false;
            for (let i = 0; i < document.lineCount; ++i) {
                const line = document.lineAt(i);
                let text = line.text;
                let firstValidCharIndex = text.search("[a-zA-Z\\*]");
                if (firstValidCharIndex < 0 || 'C' !== text[firstValidCharIndex]) {
                    continue;
                }
                if (firstValidCharIndex + 1 < text.length && '*' === text[firstValidCharIndex + 1]) {
                    continue;
                }
                let cPosition = text.indexOf("C");
                if ('*' === text[cPosition + 1]) {
                    cPosition++;
                }
                let matchStart = text.match("^.*(C\\s*(FOR|IF|DOW|DOU|SELECT|WHEN|OTHER|DCL-PROC|DCL-PI|DCL-PR|DCL-DS)|(C.*BEGSR.*)|(C\\s+\\w+\\s+DO))\\b") != null;
                let matchEnd = text.match("^.*(C\\s*(ENDFOR|ENDIF|ENDDO|ENDSL|WHEN|OTHER|END-PROC|END-PI|END-PR|END-DS)|C(SR)?\\s*ENDSR)\\b") != null;
                if (matchEnd) {
                    indentationDeep--;
                }
                let deep = indentationDeep;
                if (lastLineEndWithAndOr) {
                    deep--;
                }
                let containElse = text.match("\\bELSE\\b") != null;
                if (containElse) {
                    deep--;
                }
                let textEdit = replaceText(cPosition, deep, line.lineNumber);
                strDebug += (line.lineNumber + 1) + ": " + "start: " + matchStart + ", end: " + matchEnd + ", deep: " + deep + "\n";
                if (matchStart) {
                    indentationDeep++;
                }
                lastLineEndWithAndOr = text.match(".*(AND|OR)\\s*$") != null;
                console.log(line.lineNumber + ":  start " + matchStart + " , end " + matchEnd);
                if (indentationDeep < 0) {
                    vscode.window.showErrorMessage("格式化失败/(ㄒoㄒ)/~~\n请将带有debug信息的源文件发送给作者");
                    return [vscode.TextEdit.insert(new vscode.Position(document.lineCount + 1, 0), strDebug)];
                }
                // let starPosition : number = text.search("[\\*]");
                // if(starPosition >= 0) {
                // 	ret.push(vscode.TextEdit.replace(new vscode.Range(line.range.start, new vscode.Position(line.lineNumber, starPosition)), "  "));
                // } else {
                // 	let firstLetterPosition : number = text.search("[a-zA-Z]");
                // 	if(firstLetterPosition >= 0) {
                // 		ret.push(vscode.TextEdit.replace(new vscode.Range(line.range.start, new vscode.Position(line.lineNumber, firstLetterPosition)), " "));
                // 	}
                // }
                ret.push(textEdit);
            }
            if (indentationDeep != 0) {
                vscode.window.showErrorMessage("格式化失败/(ㄒoㄒ)/~~\n请将带有debug信息的源文件发送给作者");
                return [vscode.TextEdit.insert(new vscode.Position(document.lineCount + 1, 0), strDebug)];
            }
            ret.push(vscode.TextEdit.insert(new vscode.Position(document.lineCount + 1, 0), "\n\n" + mark));
            return ret;
        }
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function replaceText(cPosition, indentationDeep, lineNumber) {
    let start = new vscode.Position(lineNumber, cPosition + 1);
    let range = new vscode.Range(start, start);
    let str = "";
    for (let i = 0; i < indentationDeep; i++) {
        str += "    ";
    }
    return vscode.TextEdit.replace(range, str);
}
//# sourceMappingURL=extension.js.map