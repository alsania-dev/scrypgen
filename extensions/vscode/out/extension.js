"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
/**
 * ScrypGen VSCode Extension
 * Integrates ScrypGen script generation into Visual Studio Code
 * Alsania Protocol v1.0 - Built by Sigma, Powered by Echo
 */
function activate(context) {
    console.log('ScrypGen extension is now active!');
    // Register the generate script command
    let generateScriptCommand = vscode.commands.registerCommand('scrypgen.generateScript', async () => {
        await generateScript();
    });
    // Register the generate script from selection command
    let generateScriptFromSelectionCommand = vscode.commands.registerCommand('scrypgen.generateScriptFromSelection', async () => {
        await generateScript(true);
    });
    context.subscriptions.push(generateScriptCommand, generateScriptFromSelectionCommand);
}
exports.activate = activate;
async function generateScript(fromSelection = false) {
    try {
        let description;
        if (fromSelection) {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }
            const selection = editor.selection;
            description = editor.document.getText(selection);
            if (!description.trim()) {
                vscode.window.showErrorMessage('No text selected');
                return;
            }
        }
        else {
            description = await vscode.window.showInputBox({
                prompt: 'Describe the script you want to generate',
                placeHolder: 'e.g., Create a Python script that reads CSV files and generates statistics'
            });
            if (!description) {
                return;
            }
        }
        const language = await vscode.window.showQuickPick(['auto', 'python', 'bash'
        ], {
            placeHolder: 'Select script language',
            canPickMany: false
        });
        if (!language) {
            return;
        }
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Generating script with ScrypGen...',
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Analyzing request...'
            });
            try {
                const scriptCode = await executeScrypGen(description, language);
                progress.report({ increment: 50, message: 'Script generated successfully!'
                });
                const languageId = language === 'auto' ? 'python' : language;
                const doc = await vscode.workspace.openTextDocument({
                    content: scriptCode,
                    language: languageId
                });
                await vscode.window.showTextDocument(doc);
                progress.report({ increment: 100, message: 'Done!'
                });
                vscode.window.showInformationMessage('Script generated successfully with ScrypGen!');
            }
            catch (error) {
                vscode.window.showErrorMessage(`ScrypGen generation failed: ${error}`);
            }
        });
    }
    catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
    }
}
function deactivate() {
    console.log('ScrypGen extension deactivated');
}
exports.deactivate = deactivate;
/**
 * Execute ScrypGen CLI command
 */
async function executeScrypGen(description, language) {
    return new Promise((resolve, reject) => {
        const args = ['generate', `"${description}"`
        ];
        if (language !== 'auto') {
            args.push('--language', language);
        }
        const scrypgen = cp.spawn('scrypgen', args, {
            cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd(),
            shell: true
        });
        let stdout = '';
        let stderr = '';
        scrypgen.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        scrypgen.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        scrypgen.on('close', (code) => {
            if (code === 0) {
                const lines = stdout.split('\n');
                let scriptStart = false;
                const scriptLines = [];
                for (const line of lines) {
                    if (scriptStart || line.includes('#!/') || line.includes('import ') || line.includes('# ')) {
                        scriptStart = true;
                        scriptLines.push(line);
                    }
                }
                resolve(scriptLines.join('\n'));
            }
            else {
                reject(new Error(stderr || `ScrypGen exited with code ${code}`));
            }
        });
        scrypgen.on('error', (error) => {
            reject(error);
        });
    });
}
//# sourceMappingURL=extension.js.map