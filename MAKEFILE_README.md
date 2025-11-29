# ScrypGen Makefile Guide

> Alsania Protocol v1.0 - Built by Sigma, Powered by Echo

This document provides detailed instructions for using the ScrypGen Makefile to manage the project lifecycle, from development to deployment.

## Overview

The Makefile provides a comprehensive set of commands for:
- Installing dependencies
- Building and testing the project
- Running development workflows
- Setting up integrations
- Deploying to production
- Maintenance and monitoring

## Quick Start

```bash
# Show all available commands
make help

# Complete setup for new installation
make setup-all

# Development workflow
make dev-workflow

# Production deployment
make production
```

## Available Commands

### Core Commands

#### `make help`
Displays this help message with all available commands and their descriptions.

```bash
make help
```

#### `make install`
Installs all project dependencies using npm.

```bash
make install
```

#### `make build`
Builds the project in production mode after cleaning artifacts.

```bash
make build
```

#### `make dev`
Starts the development server with hot reload.

```bash
make dev
```

#### `make test`
Runs the complete test suite.

```bash
make test
```

#### `make test-coverage`
Runs tests with coverage reporting.

```bash
make test-coverage
```

#### `make clean`
Removes all build artifacts and temporary files.

```bash
make clean
```

#### `make lint`
Runs ESLint to check and fix code style issues.

```bash
make lint
```

#### `make format`
Formats code using Prettier.

```bash
make format
```

#### `make docs`
Displays documentation status (README is comprehensive).

```bash
make docs
```

### Health and Monitoring

#### `make health`
Checks system health and required dependencies.

```bash
make health
```

Validates:
- Node.js installation
- Python 3 availability
- Bash shell presence

### Installation and Distribution

#### `make install-global`
Builds and installs ScrypGen globally for CLI usage.

```bash
make install-global
```

After installation, use `scrypgen` command directly.

#### `make build-extensions`
Builds IDE extensions for VS Code, Atom, and Sublime Text.

```bash
make build-extensions
```

### Integration Setup

#### `make setup-nemo`
Sets up Nemo file manager integration.

```bash
make setup-nemo
```

Creates the actions directory: `~/.local/share/nemo/actions`

#### `make setup-kde`
Sets up KDE Connect integration.

```bash
make setup-kde
```

Creates the configuration directory: `~/.config/kdeconnect`

#### `make setup-all`
Complete setup including dependencies, build, and all integrations.

```bash
make setup-all
```

This runs: `install build install-global setup-nemo setup-kde health`

### Example Generation

#### `make example`
Generates a sample backup script to demonstrate functionality.

```bash
make example
```

Creates `example_backup.sh` in the current directory.

#### `make create-examples`
Creates comprehensive examples for testing.

```bash
make create-examples
```

Generates examples in `examples/generated/`:
- Python CSV analyzer
- Bash system monitor
- Nemo compression action

### Development Workflows

#### `make dev-workflow`
Complete development cycle: clean, install, build, test.

```bash
make dev-workflow
```

#### `make production`
Production build with all validations.

```bash
make production
```

Runs: `clean install build test lint`

### Information Commands

#### `make info`
Displays project information.

```bash
make info
```

Shows:
- Version
- Author
- License
- Repository
- Alsania Protocol version

#### `make setup-wizard`
Interactive setup wizard with guided prompts.

```bash
make setup-wizard
```

## Command Reference

| Command | Description | Dependencies |
|---------|-------------|--------------|
| `help` | Show help message | None |
| `install` | Install dependencies | npm |
| `build` | Build project | npm, TypeScript |
| `dev` | Development server | npm |
| `test` | Run tests | npm, Jest |
| `test-coverage` | Tests with coverage | npm, Jest |
| `clean` | Clean artifacts | rm |
| `lint` | Code linting | ESLint |
| `format` | Code formatting | Prettier |
| `docs` | Documentation status | None |
| `health` | System health check | node, python3, bash |
| `install-global` | Global CLI install | npm |
| `build-extensions` | Build IDE extensions | npm |
| `setup-nemo` | Setup Nemo integration | mkdir |
| `setup-kde` | Setup KDE integration | mkdir |
| `setup-all` | Complete setup | All above |
| `example` | Generate example script | npm |
| `create-examples` | Create test examples | npm |
| `dev-workflow` | Development cycle | npm |
| `production` | Production build | npm |
| `info` | Project info | None |
| `setup-wizard` | Interactive setup | bash |

## Environment Variables

The Makefile respects several environment variables:

```bash
# Node.js options
export NODE_OPTIONS="--max-old-space-size=4096"

# Custom paths
export NPM_CONFIG_PREFIX=/usr/local
export PATH=/usr/local/bin:$PATH

# Build options
export BUILD_MODE=production
export COMPRESS=true
```

## Customization

### Adding New Commands

To add a new Makefile target:

```makefile
## Brief description of the command
new-command:
	@echo "Running new command..."
	# Command implementation
	@echo "New command completed"
```

### Modifying Existing Commands

Edit the corresponding target in the Makefile:

```makefile
build:
	@echo "$(CYAN)🏗️  Building project...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Build complete!$(NC)"
```

## Troubleshooting

### Common Issues

#### Permission Errors
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### Build Failures
```bash
# Clear caches
make clean
npm cache clean --force
rm -rf node_modules
make install
```

#### Integration Issues
```bash
# Reset integrations
rm -rf ~/.local/share/nemo/actions/scrypgen*
rm -rf ~/.config/kdeconnect/scrypgen*
make setup-all
```

#### Test Failures
```bash
# Run tests individually
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Debug Mode

Enable verbose output:

```bash
# Show command execution
make SHELL="/bin/bash -x"

# Verbose npm output
npm config set loglevel verbose
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: make install
    - run: make build
    - run: make test
    - run: make lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    - run: make production
    - run: make install-global
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any

    stages {
        stage('Setup') {
            steps {
                sh 'make install'
            }
        }

        stage('Build') {
            steps {
                sh 'make build'
            }
        }

        stage('Test') {
            steps {
                sh 'make test'
            }
        }

        stage('Deploy') {
            steps {
                sh 'make install-global'
            }
        }
    }

    post {
        always {
            sh 'make clean'
        }
    }
}
```

## Performance Optimization

### Parallel Execution

```bash
# Run tests in parallel
make test PARALLEL=true

# Build with multiple cores
export JOBS=$(nproc)
make build
```

### Caching

```bash
# Use npm cache
npm config set cache ~/.npm-cache

# Cache node_modules
# (handled automatically by npm/ci)
```

## Security Considerations

### Safe Commands

All Makefile commands are designed to be safe:
- No destructive operations without confirmation
- Proper error handling
- Secure path handling
- No hardcoded credentials

### Audit Commands

```bash
# Check for security issues
npm audit

# Update dependencies safely
npm update --audit

# Check for outdated packages
npm outdated
```

## Contributing

When contributing to the Makefile:

1. Follow the existing pattern
2. Add proper documentation
3. Test on multiple platforms
4. Update this README
5. Ensure Alsania compliance

### Code Style

```makefile
## Descriptive comment
target-name:
	@echo "$(CYAN)📝 Description...$(NC)"
	# Implementation
	@echo "$(GREEN)✅ Completed!$(NC)"
```

## Support

For Makefile-related issues:

- Check `make help` for command reference
- Review this documentation
- Test commands individually
- Check system compatibility with `make health`

**Alsania Protocol v1.0** - Built by Sigma, Powered by Echo