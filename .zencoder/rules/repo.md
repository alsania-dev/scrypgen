---
description: Repository Information Overview
alwaysApply: true
---

# Universal Script Generator Information

## Summary

A tool that transforms natural language descriptions into production-ready Python and Bash scripts. It features an advanced NLP engine for intent recognition, Alsania-themed templates, and integrations with Nemo File Manager, KDE Connect, and VS Code.

## Structure

- **src/**: Core source code
  - **core/**: Main engine components (script-generator, nlp-parser, template-engine)
  - **cli/**: Command-line interface implementation
  - **gui/**: Electron-based GUI (planned)
  - **integrations/**: Platform integrations (nemo, kde, vscode)
  - **templates/**: Script templates
- **tests/**: Test suites (unit, integration, e2e)
- **extensions/**: Editor extensions (vscode, sublime, atom)
- **examples/**: Example scripts and usage patterns
- **dist/**: Compiled JavaScript output

## Language & Runtime

**Language**: TypeScript
**Version**: ES2020 target
**Node.js**: >=16.0.0
**Python**: >=3.8.0 (for integrations)
**Build System**: TypeScript Compiler (tsc)
**Package Manager**: npm

## Dependencies

**Main Dependencies**:

- @genkit-ai/mcp: ^1.21.0 (Model Control Protocol)
- commander: ^11.0.0 (CLI framework)
- inquirer: ^9.2.0 (Interactive prompts)
- compromise: ^14.10.0 (NLP processing)
- natural: ^6.12.0 (Natural language toolkit)
- handlebars: ^4.7.8 (Template engine)
- electron: ^25.0.0 (GUI framework)
- fs-extra: ^11.1.1 (Enhanced file system)
- chalk: ^5.3.0 (Terminal styling)
- ora: ^6.3.0 (Terminal spinners)

**Development Dependencies**:

- typescript: ^5.1.0
- jest: ^29.6.0 (Testing framework)
- ts-jest: ^29.1.0
- eslint: ^8.44.0
- prettier: ^3.0.0
- husky: ^8.0.3 (Git hooks)
- webpack: ^5.88.0

## Build & Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Install globally for CLI usage
npm link

# Run tests
npm test
```

## Testing

**Framework**: Jest
**Test Location**: tests/ directory
**Naming Convention**: _.test.ts, _.spec.ts
**Configuration**: jest.config.js
**Run Command**:

```bash
npm test
npm run test:watch
npm run test:coverage
```

## CLI Commands

**Main Commands**:

- `scriptgen generate <description>`: Generate script from description
- `scriptgen interactive`: Interactive wizard mode
- `scriptgen kde-transform <command>`: Transform for KDE Connect
- `scriptgen nemo-action <description>`: Generate Nemo action
- `scriptgen health`: System health check

**Options**:

- `-l, --language <lang>`: Target language (python/bash/auto)
- `-o, --output <path>`: Output file path
- `--nemo`: Include Nemo integration
- `--kde`: Include KDE Connect integration
- `--vscode`: Include VS Code snippets

## Integrations

**Nemo File Manager**:

- Generates context menu actions
- Installation path: ~/.local/share/nemo/actions/

**KDE Connect**:

- Transforms commands for phone execution
- Installation path: ~/.kde/share/apps/kdeconnect

**VS Code Extension**:

- Generates code snippets
- Build command: `npm run build:vscode`

## Configuration

**Environment Variables**:

- DEBUG: Enable debug mode
- LOG_LEVEL: Set logging level
- DEFAULT_PYTHON_VERSION: Python version
- DEFAULT_BASH_SHELL: Bash shell path
- SCRIPT_OUTPUT_DIR: Output directory

## Alsania Protocol Compliance

This project follows the Alsania Protocol v1.0 for digital sovereignty:

- **Aligned**: True
- **Protocol**: v1.0
- **Sovereign**: True
- **Built By**: Sigma
- **Powered By**: Echo

The project adheres to Alsania design principles including user sovereignty, transparency, and security-first development.
