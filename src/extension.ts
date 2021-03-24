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
			let ret : vscode.TextEdit[] = []
			let indentationDeep : number = 0;
			let lastLineEndWithAndOr : boolean = false;
			for (let i : number = 0; i < document.lineCount; ++i) {
				const line : vscode.TextLine = document.lineAt(i);
				let text : string = line.text;
				let firstValidCharIndex : number = text.search("[a-zA-Z\\*]");
				console.log(line.lineNumber + ": " + firstValidCharIndex);
				if(firstValidCharIndex < 0 || '*' === text[firstValidCharIndex]) {
					continue;
				}
				let cPosition : number = text.indexOf("C");
			
				let matchStart : boolean = text.match("^.*(C\\s*(FOR|IF|DO|DOW|DOU|SELECT|WHEN|OTHER|BEGSR|DCL-PROC|DCL-PI|DCL-PR|DCL-DS)|CSR\\s*#.*)\\b") != null;
				let matchEnd : boolean = text.match("^.*(C\\s*(ENDFOR|ENDIF|ENDDO|ENDSL|WHEN|OTHER|ENDSR|END-PROC|END-PI|END-PR|END-DS)|CSR\\s*ENDSR)\\b") != null;
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
				if(matchStart) {
					indentationDeep++;
				}
				
				lastLineEndWithAndOr = text.match(".*(AND|OR)\\s*$") != null;
				console.log(line.lineNumber + ":  start " + matchStart + " , end " + matchEnd);
				if(indentationDeep < 0) {
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

// this method is called when your extension is deactivated
export function deactivate() {}

function replaceText(cPosition : number, indentationDeep : number, lineNumber : number) : vscode.TextEdit{
	let start : vscode.Position = new vscode.Position(lineNumber, cPosition + 1);
	let range : vscode.Range = new vscode.Range(start, start);
	let str : string = "";
	for (let i = 0; i < indentationDeep; i++) {
		str += "\t";
		
	}
	return vscode.TextEdit.replace(range, str);
}
