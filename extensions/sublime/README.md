# ScrypGen Sublime Text Plugin

> Transform natural language into powerful scripts with AI precision
> Alsania Protocol v1.0 • Built by Sigma • Powered by Echo

[![License: MIT](https://img.shields.io/badge/License-MIT-00ff7f.svg)](https://opensource.org/licenses/MIT)
[![Sublime Text](https://img.shields.io/badge/Sublime_Text-3+-ff9800.svg)](https://www.sublimetext.com/)

A Sublime Text plugin that integrates ScrypGen's script generation capabilities directly into your Sublime Text editor workflow.

## Features

- **Natural Language to Code**: Describe what you want in plain English
- **Multi-Language Support**: Generate Python and Bash scripts
- **Seamless Integration**: Works directly within Sublime Text
- **Alsania Compliant**: Follows digital sovereignty principles

## Installation

### Package Control (Recommended)

1. Install Package Control if you haven't already
2. Open Command Palette (Ctrl+Shift+P)
3. Type "Package Control: Install Package"
4. Search for "ScrypGen"
5. Click Install

### Manual Installation

1. Download/clone this repository
2. Copy the `scrypgen` folder to `~/Library/Application Support/Sublime Text 3/Packages/` (macOS)
   - Or `%APPDATA%\Sublime Text 3\Packages\` (Windows)
   - Or `~/.config/sublime-text-3/Packages/` (Linux)
3. Restart Sublime Text

## Usage

### Command Palette

1. Open Command Palette (Ctrl+Shift+P)
2. Type "ScrypGen: Generate Script"
3. Enter your script description
4. Select the desired language (Auto/Python/Bash)
5. Your generated script will open in a new tab

### Menu

- Tools → ScrypGen → Generate Script
- Tools → ScrypGen → Show Menu

### Example Descriptions

- "Create a Python script that reads CSV files and generates statistics"
- "Write a Bash script to backup files to an external drive"
- "Generate a Python web scraper for news articles"
- "Create a Bash monitoring script for system resources"

## Requirements

- Sublime Text 3+
- ScrypGen CLI installed and available in PATH
- Python (for ScrypGen)

## Development

### Testing the Plugin

1. Open Sublime Text Console (Ctrl+`)
2. Run Python commands to test functionality

### Creating a Package

```bash
# Create .sublime-package file
cd /path/to/scrypgen-sublime
zip -r ScrypGen.sublime-package *
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