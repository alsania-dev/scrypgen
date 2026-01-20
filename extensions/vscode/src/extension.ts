import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';

/**
 * ScrypGen VSCode Extension
 * Integrates ScrypGen script generation into Visual Studio Code
 * Alsania Protocol v1.0 - Built by Sigma, Powered by Echo
 */

export function activate(context: vscode.ExtensionContext) {
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

async function generateScript(fromSelection: boolean = false) {
    try {
        let description: string | undefined;

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
        } else {
            description = await vscode.window.showInputBox({
                prompt: 'Describe the script you want to generate',
                placeHolder: 'e.g., Create a Python script that reads CSV files and generates statistics'
            });

            if (!description) {
                return;
            }
        }

        const language = await vscode.window.showQuickPick(
            ['auto', 'python', 'bash'
        ],
        {
                placeHolder: 'Select script language',
                canPickMany: false
        }
        );

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
                const scriptCode = await executeScrypGen(description!, language!);

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
            } catch (error) {
                vscode.window.showErrorMessage(`ScrypGen generation failed: ${error
                }`);
            }
        });
    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error
        }`);
    }
}

export function deactivate() {
    console.log('ScrypGen extension deactivated');
}
/**
 * Execute ScrypGen CLI command
 */
async function executeScrypGen(description: string, language: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const args = ['generate', `"${description}"`
        ];

        if (language !== 'auto') {
            args.push('--language', language);
        }

        const scrypgen = cp.spawn('scrypgen', args,
        {
            cwd: vscode.workspace.workspaceFolders?.[
                0
            ]?.uri.fsPath || process.cwd(),
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
                const scriptLines: string[] = [];

                for (const line of lines) {
                    if (scriptStart || line.includes('#!/') || line.includes('import ') || line.includes('# ')) {
                        scriptStart = true;
                        scriptLines.push(line);
                    }
                }

                resolve(scriptLines.join('\n'));
            } else {
                reject(new Error(stderr || `ScrypGen exited with code ${code
                }`));
            }
        });

        scrypgen.on('error', (error) => {
            reject(error);
        });
    });
}