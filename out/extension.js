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
            let ret = [];
            let indentationDeep = 0;
            let lastLineEndWithAndOr = false;
            for (let i = 0; i < document.lineCount; ++i) {
                const line = document.lineAt(i);
                let text = line.text;
                let firstValidCharIndex = text.search("[a-zA-Z\\*]");
                console.log(line.lineNumber + ": " + firstValidCharIndex);
                if (firstValidCharIndex < 0 || '*' === text[firstValidCharIndex]) {
                    continue;
                }
                let cPosition = text.indexOf("C");
                let matchStart = text.match("^.*(C\\s*(FOR|IF|DO|DOW|DOU|SELECT|WHEN|OTHER|BEGSR|DCL-PROC|DCL-PI|DCL-PR|DCL-DS)|CSR\\s*#.*)\\b") != null;
                let matchEnd = text.match("^.*(C\\s*(ENDFOR|ENDIF|ENDDO|ENDSL|WHEN|OTHER|ENDSR|END-PROC|END-PI|END-PR|END-DS)|CSR\\s*ENDSR)\\b") != null;
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
                if (matchStart) {
                    indentationDeep++;
                }
                lastLineEndWithAndOr = text.match(".*(AND|OR)\\s*$") != null;
                console.log(line.lineNumber + ":  start " + matchStart + " , end " + matchEnd);
                if (indentationDeep < 0) {
                    vscode.window.showErrorMessage("代码有问题，格式化失败/(ㄒoㄒ)/~~");
                    return [];
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
        str += "\t";
    }
    return vscode.TextEdit.replace(range, str);
}
//# sourceMappingURL=extension.js.map