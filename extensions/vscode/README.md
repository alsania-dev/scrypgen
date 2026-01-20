# ScrypGen VSCode Extension

> Transform natural language into powerful scripts with AI precision
> Alsania Protocol v1.0 • Built by Sigma • Powered by Echo

[![License: MIT](https://img.shields.io/badge/License-MIT-00ff7f.svg)](https://opensource.org/licenses/MIT)
[![VS Code](https://img.shields.io/badge/VS_Code-1.74+-007acc.svg)](https://code.visualstudio.com/)

A Visual Studio Code extension that integrates ScrypGen's script generation capabilities directly into your development workflow.

## Features

- **Natural Language to Code**: Describe what you want in plain English
- **Multi-Language Support**: Generate Python and Bash scripts
- **Seamless Integration**: Works directly within VS Code
- **Alsania Compliant**: Follows digital sovereignty principles

## Installation

### From VS Code Marketplace (Recommended)

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "ScrypGen"
4. Click Install

### Manual Installation

1. Download the `.vsix` file from releases
2. In VS Code: Extensions → Install from VSIX...
3. Select the downloaded file

## Usage

1. Open the Command Palette (Ctrl+Shift+P)
2. Type "Generate Script from Description"
3. Enter your script description
4. Select the desired language (Python/Bash/Auto)
5. Your generated script will open in a new editor tab

### Example Descriptions

- "Create a Python script that reads CSV files and generates statistics"
- "Write a Bash script to backup files to an external drive"
- "Generate a Python web scraper for news articles"
- "Create a Bash monitoring script for system resources"

## Requirements

- VS Code 1.74+
- ScrypGen CLI installed and available in PATH
- Node.js (for ScrypGen)

## Development

### Building the Extension

```bash
npm install
npm run compile
```

### Testing

```bash
npm run test
```

### Packaging

```bash
npm install -g vsce
vsce package
```

## Contributing

Contributions are welcome! Please follow the Alsania Protocol guidelines:

- Use free and open-source tools
- Respect digital sovereignty
- Maintain code quality and security

## License

MIT License - see LICENSE file for details

## Links

- [ScrypGen Core](https://github.com/alsania-dev/scrypgen)
- [Alsania Ecosystem](https://github.com/alsania)
- [Report Issues](https://github.com/alsania-dev/scrypgen/issues)

---

**🔮 Built with Digital Sovereignty in Mind**