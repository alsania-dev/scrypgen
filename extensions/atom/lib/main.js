"use strict";

/**
 * ScrypGen Atom Package
 * Integrates ScrypGen script generation into Atom editor
 * Alsania Protocol v1.0 - Built by Sigma, Powered by Echo
 */

const { CompositeDisposable } = require("atom");
const { spawn } = require("child_process");

module.exports = {
  subscriptions: null,

  activate(state) {
    console.log("ScrypGen Atom package activated");

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register commands
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "scrypgen:generate-script": () => this.generateScript(),
        "scrypgen:generate-script-from-selection": () =>
          this.generateScriptFromSelection(),
      })
    );
  },

  deactivate() {
    console.log("ScrypGen Atom package deactivated");
    this.subscriptions.dispose();
  },

  serialize() {
    return {};
  },

  /**
   * Generate script from natural language description
   */
  generateScript() {
    // Show input dialog for description
    const description = prompt("Describe the script you want to generate:", "");
    if (!description) {
      return; // User cancelled
    }

    this.generateWithDescription(description);
  },

  /**
   * Generate script from selected text
   */
  generateScriptFromSelection() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      atom.notifications.addError("No active editor found");
      return;
    }

    const selection = editor.getSelectedText();
    if (!selection.trim()) {
      atom.notifications.addError("No text selected");
      return;
    }

    this.generateWithDescription(selection);
  },

  /**
   * Generate script with given description
   */
  generateWithDescription(description) {
    // Show language selection
    const language = this.selectLanguage();
    if (!language) {
      return; // User cancelled
    }

    // Show progress notification
    const notification = atom.notifications.addInfo(
      "Generating script with ScrypGen...",
      {
        dismissable: false,
      }
    );

    // Execute scrypgen command
    this.executeScrypGen(description, language)
      .then((scriptCode) => {
        notification.dismiss();

        // Create new editor with generated script
        const newEditor = atom.workspace.buildTextEditor();
        newEditor.setText(scriptCode);

        // Set grammar based on language
        const grammar =
          language === "python"
            ? atom.grammars.grammarForScopeName("source.python")
            : atom.grammars.grammarForScopeName("source.shell");

        if (grammar) {
          newEditor.setGrammar(grammar);
        }

        // Open the new editor
        atom.workspace.open(null, {
          item: newEditor,
          activatePane: true,
        });

        atom.notifications.addSuccess("Script generated successfully!");
      })
      .catch((error) => {
        notification.dismiss();
        atom.notifications.addError(
          `ScrypGen generation failed: ${error.message}`
        );
      });
  },

  /**
   * Show language selection dialog
   */
  selectLanguage() {
    const languages = ["auto", "python", "bash"];
    const selected = prompt(
      "Select script language (auto/python/bash):",
      "auto"
    );

    if (!selected) return null;

    const normalized = selected.toLowerCase();
    return languages.includes(normalized) ? normalized : "auto";
  },

  /**
   * Execute ScrypGen CLI command
   */
  executeScrypGen(description, language) {
    return new Promise((resolve, reject) => {
      // Build command arguments
      const args = ["generate", `"${description}"`];

      if (language !== "auto") {
        args.push("--language", language);
      }

      // Execute scrypgen command
      const scrypgen = spawn("scrypgen", args, {
        cwd: atom.project.getPaths()[0] || process.cwd(),
        shell: true,
      });

      let stdout = "";
      let stderr = "";

      scrypgen.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      scrypgen.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      scrypgen.on("close", (code) => {
        if (code === 0) {
          // Extract script code from output
          const lines = stdout.split("\n");
          let scriptStart = false;
          const scriptLines = [];

          for (const line of lines) {
            if (
              scriptStart ||
              line.includes("#!/") ||
              line.includes("import ") ||
              line.includes("# ")
            ) {
              scriptStart = true;
              scriptLines.push(line);
            }
          }

          resolve(scriptLines.join("\n"));
        } else {
          reject(new Error(stderr || `ScrypGen exited with code ${code}`));
        }
      });

      scrypgen.on("error", (error) => {
        reject(error);
      });
    });
  },
};
