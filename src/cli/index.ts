#!/usr/bin/env node
/**
 * ScrypGen - CLI Interface
 * Alsania aligned - built by Sigma, powered by Echo
 */

import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import * as fs from "fs-extra";
import * as path from "path";
import ora from "ora";
import boxen from "boxen";
import { UniversalScriptGenerator } from "../core/script-generator";
import {
  GeneratorConfig,
  ScriptGenerationRequest,
  Logger,
  Integration,
} from "../core/types";

// Alsania-themed CLI styling
const theme = {
  primary: chalk.hex("#00ff7f"), // Neon green
  secondary: chalk.hex("#00ffff"), // Electric cyan
  accent: chalk.hex("#8a2be2"), // Royal purple
  text: chalk.white,
  dim: chalk.gray,
  error: chalk.red,
  success: chalk.green,
  warning: chalk.yellow,
};

// Simple console logger
const logger: Logger = {
  info: (msg: string, meta?: any) =>
    console.log(theme.text(`ℹ️ ${msg}`), meta || ""),
  warn: (msg: string, meta?: any) =>
    console.log(theme.warning(`⚠️ ${msg}`), meta || ""),
  error: (msg: string, meta?: any) =>
    console.error(theme.error(`💥 ${msg}`), meta || ""),
  debug: (msg: string, meta?: any) =>
    process.env.DEBUG && console.log(theme.dim(`🐛 ${msg}`), meta || ""),
};

class UniversalScriptGeneratorCLI {
  private generator: UniversalScriptGenerator;
  private program: Command;

  constructor() {
    this.program = new Command();
    this.setupCommands();

    // Initialize generator with default config
    const config: GeneratorConfig = {
      defaultLanguage: "auto",
      pythonVersion: "3.8",
      bashShell: "/bin/bash",
      outputDirectory: "./generated_scripts",
      templateDirectory: "./templates",
      enableAI: false,
      enableNLP: true,
      validateScripts: true,
      sandboxExecution: false,
      alsaniaCompliance: true,
    };

    this.generator = new UniversalScriptGenerator(config, logger);
  }

  private setupCommands(): void {
    this.program
      .name("scrypgen")
      .description(
        "🔮 ScrypGen - Transform natural language into powerful scripts"
      )
      .version("1.0.0")
      .option("-v, --verbose", "Enable verbose logging")
      .option("--debug", "Enable debug mode")
      .hook("preAction", (thisCommand) => {
        if (thisCommand.opts().debug) {
          process.env.DEBUG = "1";
        }
      });

    // Generate command
    this.program
      .command("generate")
      .alias("gen")
      .description("Generate a script from natural language description")
      .argument(
        "<description>",
        "Natural language description of what the script should do"
      )
      .option(
        "-l, --language <lang>",
        "Target language (python, bash, auto)",
        "auto"
      )
      .option("-o, --output <path>", "Output file path")
      .option("--nemo", "Generate Nemo file manager integration")
      .option("--kde", "Generate KDE Connect integration")
      .option("--vscode", "Generate VS Code integration")
      .option("--no-validate", "Skip script validation")
      .action(async (description, options) => {
        await this.generateCommand(description, options);
      });

    // Interactive command
    this.program
      .command("interactive")
      .alias("i")
      .description("Interactive script generation wizard")
      .action(async () => {
        await this.interactiveCommand();
      });

    // KDE Connect specific command
    this.program
      .command("kde-transform")
      .description("Transform a terminal command for KDE Connect execution")
      .argument("<command>", "Terminal command to transform")
      .option("-n, --name <name>", "Command name", "Transformed Command")
      .option("-o, --output <path>", "Output file path")
      .action(async (command, options) => {
        await this.kdeTransformCommand(command, options);
      });

    // Nemo action command
    this.program
      .command("nemo-action")
      .description("Generate a Nemo file manager action")
      .argument("<description>", "Description of the action")
      .option("-n, --name <name>", "Action name", "Custom Action")
      .option("-o, --output <path>", "Output directory")
      .action(async (description, options) => {
        await this.nemoActionCommand(description, options);
      });

    // Health check command
    this.program
      .command("health")
      .description("Check system health and dependencies")
      .action(async () => {
        await this.healthCommand();
      });

    // About command
    this.program
      .command("about")
      .description("Show information about Universal Script Generator")
      .action(() => {
        this.showAbout();
      });
  }

  private async generateCommand(
    description: string,
    options: any
  ): Promise<void> {
    try {
      this.showHeader();

      const spinner = ora({
        text: theme.primary("🔮 Analyzing your request..."),
        color: "cyan",
      }).start();

      // Prepare integrations
      const integrations = [];
      if (options.nemo) integrations.push({ type: "nemo", enabled: true });
      if (options.kde)
        integrations.push({ type: "kde-connect", enabled: true });
      if (options.vscode) integrations.push({ type: "vscode", enabled: true });

      const request: ScriptGenerationRequest = {
        description,
        language: options.language === "auto" ? undefined : options.language,
        ...(integrations.length > 0 && {
          integrations: integrations as Integration[],
        }),
        includeTests: false,
        includeDocumentation: true,
      };

      spinner.text = theme.primary("⚡ Generating your script...");

      const result = await this.generator.generateScript(request);

      spinner.stop();

      if (result.success) {
        console.log(theme.success("✨ Script generated successfully!"));
        console.log();

        // Display metadata
        this.displayMetadata(result.metadata);

        if (options.output) {
          await this.saveScript(result.code, options.output, result.language);
          console.log(theme.success(`💾 Script saved to: ${options.output}`));
        } else {
          // Display script in a nice box
          console.log(
            boxen(result.code, {
              title: `${result.language.toUpperCase()} Script`,
              titleAlignment: "center",
              padding: 1,
              margin: 1,
              borderStyle: "double",
              borderColor: "cyan",
            })
          );
        }

        // Show integration files
        if (result.integrationFiles && result.integrationFiles.length > 0) {
          console.log(theme.secondary("\n🔗 Integration files generated:"));
          result.integrationFiles.forEach((file) => {
            console.log(theme.dim(`  📄 ${file.filename} (${file.type})`));
          });
        }

        // Show warnings and suggestions
        if (result.warnings.length > 0) {
          console.log(theme.warning("\n⚠️  Warnings:"));
          result.warnings.forEach((warning) => {
            console.log(theme.warning(`  • ${warning}`));
          });
        }

        if (result.suggestions.length > 0) {
          console.log(theme.primary("\n💡 Suggestions:"));
          result.suggestions.forEach((suggestion) => {
            console.log(theme.dim(`  • ${suggestion}`));
          });
        }
      } else {
        console.log(theme.error("💥 Script generation failed!"));
        result.errors.forEach((error) => {
          console.log(theme.error(`  • ${error}`));
        });
        process.exit(1);
      }
    } catch (error) {
      console.error(theme.error(`💥 Error: ${error}`));
      process.exit(1);
    }
  }

  private async interactiveCommand(): Promise<void> {
    this.showHeader();

    try {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "description",
          message: theme.primary("📝 Describe what your script should do:"),
          validate: (input: string) =>
            input.trim().length > 0 || "Please provide a description",
        },
        {
          type: "list",
          name: "language",
          message: theme.primary("🔧 Choose your preferred language:"),
          choices: [
            { name: "🤖 Auto-detect (recommended)", value: "auto" },
            { name: "🐍 Python", value: "python" },
            { name: "📜 Bash", value: "bash" },
          ],
          default: "auto",
        },
        {
          type: "checkbox",
          name: "integrations",
          message: theme.primary("🔗 Select integrations:"),
          choices: [
            { name: "📁 Nemo File Manager Action", value: "nemo" },
            { name: "📱 KDE Connect Command", value: "kde" },
            { name: "💻 VS Code Snippet", value: "vscode" },
          ],
        },
        {
          type: "list",
          name: "complexity",
          message: theme.primary("⚡ Expected complexity:"),
          choices: [
            { name: "🟢 Simple (basic functionality)", value: "simple" },
            { name: "🟡 Medium (moderate features)", value: "medium" },
            { name: "🔴 Complex (advanced features)", value: "complex" },
          ],
          default: "medium",
        },
        {
          type: "input",
          name: "output",
          message: theme.primary("💾 Output file path (optional):"),
          default: "",
        },
      ]);

      // Generate script with interactive options
      const options = {
        language: answers.language,
        output: answers.output || undefined,
        nemo: answers.integrations.includes("nemo"),
        kde: answers.integrations.includes("kde"),
        vscode: answers.integrations.includes("vscode"),
      };

      await this.generateCommand(answers.description, options);
    } catch (error) {
      if ((error as any).name === "ExitPromptError") {
        console.log(theme.dim("\\n👋 Goodbye!"));
      } else {
        console.error(theme.error(`💥 Interactive session failed: ${error}`));
      }
    }
  }

  private async kdeTransformCommand(
    command: string,
    options: any
  ): Promise<void> {
    try {
      this.showHeader();

      const spinner = ora({
        text: theme.primary("📱 Transforming command for KDE Connect..."),
        color: "cyan",
      }).start();

      const result = await this.generator.generateKDEConnectScript(
        `Transform the command: ${command}`,
        command
      );

      spinner.stop();

      if (result.success) {
        console.log(theme.success("✨ KDE Connect script generated!"));

        if (options.output) {
          await this.saveScript(result.code, options.output, "bash");
          console.log(theme.success(`💾 Script saved to: ${options.output}`));
        } else {
          console.log(
            boxen(result.code, {
              title: "KDE Connect Script",
              titleAlignment: "center",
              padding: 1,
              margin: 1,
              borderStyle: "double",
              borderColor: "magenta",
            })
          );
        }

        console.log(theme.primary("\\n📋 Setup Instructions:"));
        console.log(
          theme.dim("1. Save the script to a file (e.g., kde_command.sh)")
        );
        console.log(
          theme.dim("2. Make it executable: chmod +x kde_command.sh")
        );
        console.log(
          theme.dim(
            "3. Configure KDE Connect to run this script from your phone"
          )
        );
      } else {
        console.log(theme.error("💥 KDE transformation failed!"));
        result.errors.forEach((error) => {
          console.log(theme.error(`  • ${error}`));
        });
      }
    } catch (error) {
      console.error(theme.error(`💥 KDE transformation error: ${error}`));
      process.exit(1);
    }
  }

  private async nemoActionCommand(
    description: string,
    options: any
  ): Promise<void> {
    try {
      this.showHeader();

      const spinner = ora({
        text: theme.primary("📁 Generating Nemo action..."),
        color: "cyan",
      }).start();

      const result = await this.generator.generateNemoAction(
        description,
        options.name
      );

      spinner.stop();

      if (result.success) {
        console.log(theme.success("✨ Nemo action generated!"));

        const outputDir = options.output || "./nemo_action";
        await fs.ensureDir(outputDir);

        // Save main script
        const scriptPath = path.join(
          outputDir,
          `${options.name.toLowerCase().replace(/\\s+/g, "_")}.sh`
        );
        await this.saveScript(result.code, scriptPath, "bash");

        // Save integration files
        if (result.integrationFiles) {
          for (const file of result.integrationFiles) {
            const filePath = path.join(outputDir, file.filename);
            await fs.writeFile(filePath, file.content);
            console.log(theme.success(`💾 ${file.filename} created`));
          }
        }

        console.log(theme.primary("\\n📋 Installation Instructions:"));
        console.log(theme.dim(`1. Copy ${scriptPath} to a permanent location`));
        console.log(
          theme.dim("2. Copy .nemo_action file to ~/.local/share/nemo/actions/")
        );
        console.log(
          theme.dim("3. Update the Exec path in the .nemo_action file")
        );
        console.log(theme.dim("4. Restart Nemo to see the new action"));
      } else {
        console.log(theme.error("💥 Nemo action generation failed!"));
        result.errors.forEach((error) => {
          console.log(theme.error(`  • ${error}`));
        });
      }
    } catch (error) {
      console.error(theme.error(`💥 Nemo action error: ${error}`));
      process.exit(1);
    }
  }

  private async healthCommand(): Promise<void> {
    this.showHeader();

    const spinner = ora({
      text: theme.primary("🏥 Checking system health..."),
      color: "cyan",
    }).start();

    try {
      const health = await this.generator.healthCheck();
      spinner.stop();

      console.log(theme.primary("🏥 System Health Report"));
      console.log("━".repeat(50));

      if (health.status === "healthy") {
        console.log(theme.success("✅ All systems operational!"));
      } else if (health.status === "degraded") {
        console.log(theme.warning("⚠️  Some components degraded"));
      } else {
        console.log(theme.error("💥 System unhealthy"));
      }

      console.log();
      console.log(theme.primary("📊 Component Status:"));
      Object.entries(health.details).forEach(([key, value]) => {
        const status =
          value === "healthy" || value === true
            ? theme.success("✅")
            : theme.error("❌");
        console.log(`  ${status} ${key}: ${value}`);
      });

      if (health.details.alsaniaCompliant) {
        console.log(theme.primary("\\n🔮 Alsania Protocol v1.0 - Compliant"));
        console.log(theme.dim("   Built by Sigma, Powered by Echo"));
      }
    } catch (error) {
      spinner.stop();
      console.error(theme.error(`💥 Health check failed: ${error}`));
    }
  }

  private showHeader(): void {
    const header = boxen(
      theme.primary("🔮 ScrypGen") +
        "\\n" +
        theme.secondary("Transform ideas into code with AI precision") +
        "\\n\\n" +
        theme.dim("Alsania Protocol v1.0 • Built by Sigma • Powered by Echo"),
      {
        padding: 1,
        margin: { top: 1, bottom: 1, left: 2, right: 2 },
        borderStyle: "double",
        borderColor: "cyan",
        textAlignment: "center",
      }
    );

    console.log(header);
  }

  private showAbout(): void {
    this.showHeader();

    console.log(theme.primary("✨ About ScrypGen"));
    console.log();
    console.log(
      theme.text(
        "A revolutionary tool that transforms natural language descriptions"
      )
    );
    console.log(theme.text("into production-ready Python and Bash scripts."));
    console.log();
    console.log(theme.secondary("🌟 Key Features:"));
    console.log(theme.dim("  • 🧠 Advanced NLP for intent understanding"));
    console.log(theme.dim("  • 🎨 Beautiful Alsania-themed script templates"));
    console.log(
      theme.dim("  • 🔗 Deep integrations (Nemo, KDE Connect, VS Code)")
    );
    console.log(theme.dim("  • 🛡️  Built-in security validation"));
    console.log(theme.dim("  • 📱 Cross-platform compatibility"));
    console.log(theme.dim("  • 🚀 Optimized for Linux Mint & Android"));
    console.log();
    console.log(theme.primary("🏛️  Alsania Ecosystem:"));
    console.log(
      theme.dim("  Built for digital sovereignty and developer empowerment.")
    );
    console.log(
      theme.dim(
        "  Every script generated carries the mark of quality and freedom."
      )
    );
    console.log();
    console.log(
      theme.accent("💙 Created with passion for the developer community")
    );
  }

  private displayMetadata(metadata: any): void {
    console.log(theme.primary("📊 Script Metadata:"));
    console.log(theme.dim(`  • Template: ${metadata.templateUsed}`));
    console.log(theme.dim(`  • Complexity: ${metadata.estimatedComplexity}`));
    console.log(
      theme.dim(
        `  • Dependencies: ${metadata.dependencies.join(", ") || "None"}`
      )
    );
    console.log(theme.dim(`  • Platform: ${metadata.platform.join(", ")}`));
    console.log(
      theme.dim(
        `  • Generated: ${new Date(metadata.generatedAt).toLocaleString()}`
      )
    );
    console.log();
  }

  private async saveScript(
    code: string,
    filePath: string,
    language: string
  ): Promise<void> {
    // Ensure directory exists
    await fs.ensureDir(path.dirname(filePath));

    // Auto-add extension if not present
    if (!path.extname(filePath)) {
      filePath += language === "python" ? ".py" : ".sh";
    }

    await fs.writeFile(filePath, code);

    // Make executable if it's a script
    if (language === "bash" || filePath.endsWith(".sh")) {
      await fs.chmod(filePath, 0o755);
    }
  }

  run(): void {
    this.program.parse(process.argv);

    // Show help if no command provided
    if (!process.argv.slice(2).length) {
      this.showHeader();
      this.program.help();
    }
  }
}

// Run CLI if this file is executed directly
if (require.main === module) {
  const cli = new UniversalScriptGeneratorCLI();
  cli.run();
}

export { UniversalScriptGeneratorCLI };
