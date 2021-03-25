'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	vscode.languages.registerDocumentFormattingEditProvider('rpg', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			if(document.lineCount < 1) {
				return [];
			}

			let mark : string = " * rpg readonly cmb.done, please don't delete!!!"
			if(document.lineAt(document.lineCount - 1).text.search(mark) > -1) {
				return [];
			}

			let strDebug : string = "\n\n\nDebug message:\n";
			let ret : vscode.TextEdit[] = [];
			let indentationDeep : number = 0;
			let lastLineEndWithAndOr : boolean = false;

			for (let i : number = 0; i < document.lineCount; ++i) {
				const line : vscode.TextLine = document.lineAt(i);
				let text : string = line.text;

				let firstValidCharIndex : number = text.search("[a-zA-Z\\*]");
				if(firstValidCharIndex < 0 || 'C' !== text[firstValidCharIndex]) {
					continue;
				}

				let cPosition : number = text.indexOf("C");
				if('*' === text[cPosition+1]) {
					cPosition++;
				}
			
				let matchStart : boolean = text.match("^.*(C\\s*(FOR|IF|DO|DOW|DOU|SELECT|WHEN|OTHER|DCL-PROC|DCL-PI|DCL-PR|DCL-DS)|C.*BEGSR.*)\\b") != null;
				let matchEnd : boolean = text.match("^.*(C\\s*(ENDFOR|ENDIF|ENDDO|ENDSL|WHEN|OTHER|END-PROC|END-PI|END-PR|END-DS)|C(SR)?\\s*ENDSR)\\b") != null;
				
				if(matchEnd) {
					indentationDeep--;
				}
				
				let deep = indentationDeep;
				if(lastLineEndWithAndOr) {
					deep--;
				}

				let containElse : boolean = text.match("\\bELSE\\b") != null;
				if(containElse) {
					deep--;
				}

				let textEdit : vscode.TextEdit = replaceText(cPosition, deep, line.lineNumber);

				strDebug += (line.lineNumber+1) + ": " + "start: " + matchStart + ", end: " + matchEnd + ", deep: " + deep + "\n";

				if(matchStart) {
					indentationDeep++;
				}
				
				lastLineEndWithAndOr = text.match(".*(AND|OR)\\s*$") != null;

				console.log(line.lineNumber + ":  start " + matchStart + " , end " + matchEnd);

				if(indentationDeep < 0) {
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

			if(indentationDeep != 0) {
				vscode.window.showErrorMessage("格式化失败/(ㄒoㄒ)/~~\n请将带有debug信息的源文件发送给作者");
				return [vscode.TextEdit.insert(new vscode.Position(document.lineCount + 1, 0), strDebug)];
			}

			ret.push(vscode.TextEdit.insert(new vscode.Position(document.lineCount + 1, 0), "\n\n" + mark));
			return ret;
        }
    });
}

// this method is called when your extension is deactivated
export function deactivate() {}

function replaceText(cPosition : number, indentationDeep : number, lineNumber : number) : vscode.TextEdit{
	let start : vscode.Position = new vscode.Position(lineNumber, cPosition + 1);
	let range : vscode.Range = new vscode.Range(start, start);
	let str : string = "";
	for (let i = 0; i < indentationDeep; i++) {
		str += "    ";
	}

	return vscode.TextEdit.replace(range, str);
}
