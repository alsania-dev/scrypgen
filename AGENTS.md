# AGENTS.md

This file provides guidance to AI developers when working with code in this repository.

## Project Overview

ScrypGen is an Alsania-aligned TypeScript project that transforms natural language descriptions into production-ready Python and Bash scripts. It features advanced NLP processing, template-based generation, and deep integrations with desktop environments (Nemo, KDE Connect, VS Code).

## Architecture

### Core Engine (`src/core/`)

- **UniversalScriptGenerator**: Main orchestrator that coordinates all components through a 7-phase generation pipeline
- **EnhancedNLPParser**: Natural language processing for intent recognition and entity extraction
- **TemplateEngine**: Handlebars-powered template system with Alsania theming
- **ScriptValidator**: Security and syntax validation for generated scripts
- **IntegrationManager**: Handles platform-specific integrations (Nemo, KDE, VS Code)

### Data Flow

1. Natural language input → NLP analysis
2. Language selection (Python/Bash) based on analysis
3. Template selection and processing with Handlebars
4. Script validation (syntax + security)
5. Integration file generation
6. Metadata compilation with Alsania signature
7. Result packaging with errors/warnings/suggestions

### CLI Interface (`src/cli/`)

Beautiful Alsania-themed command-line interface using Commander.js with chalk styling:

- Primary: Neon Green (#00ff7f)
- Secondary: Electric Cyan (#00ffff)
- Accent: Royal Purple (#8a2be2)

## Common Development Commands

### Build & Development

```bash
# Full development setup
make setup-all           # Install, build, configure integrations

# Standard workflow
make dev-workflow        # Clean, install, build, test
npm run dev              # Development with hot reload
npm run build            # Production build
npm run build:watch      # Build with file watching
```

### Testing

```bash
npm test                 # Run all tests
npm run test:coverage    # Run with coverage report
npm run test:watch       # Watch mode for development

# Run specific test suites
npm test tests/unit/nlp-parser.test.ts
```

### CLI Usage

```bash
# Global installation after build
npm link                 # Makes 'scrypgen' command available
make install-global      # Build + npm link

# Core commands
scrypgen generate "description" --language python --output script.py
scrypgen interactive    # Interactive wizard
scrypgen kde-transform "git status" --name "Git Status"
scrypgen nemo-action "Compress files" --name "File Compressor"
scrypgen health         # System health check
```

### Linting & Formatting

```bash
npm run lint            # ESLint with TypeScript
npm run format          # Prettier formatting
```

### Integration Setup

```bash
make setup-nemo         # Create Nemo actions directory
make setup-kde          # Create KDE Connect directory
npm run build:extensions # Build VS Code/Sublime extensions
```

## Key Types and Interfaces

### Core Request/Response Flow

- `ScriptGenerationRequest`: Input with description, language preferences, integrations
- `ScriptGenerationResult`: Output with generated code, metadata, validation results
- `NLPAnalysis`: Intent recognition, entity extraction, complexity assessment
- `ScriptMetadata`: Template used, dependencies, permissions, Alsania signature

### Alsania Compliance

Every generated script includes an `AlsaniaSignature`:

```typescript
{
  aligned: true,
  protocol: 'v1.0',
  buildBy: 'Sigma',
  poweredBy: 'Echo',
  sovereign: true
}
```

## Template System

Uses Handlebars templates with Alsania design language. Templates are loaded dynamically based on:

- Target language (Python/Bash)
- Complexity level (simple/medium/complex)
- Integration requirements
- Platform compatibility

## Integration Architecture

### Nemo File Manager

- Generates `.nemo_action` files for context menu integration
- Creates executable scripts for file operations
- Supports MIME type filtering and selection handling

### KDE Connect

- Transforms terminal commands for phone execution
- Adds notification support and error handling
- Creates Android-compatible command shortcuts

### VS Code

- Generates code snippets for common patterns
- Creates workspace-specific templates
- Integrates with TypeScript/Python development

## Testing Strategy

### Test Structure

- `tests/unit/`: Component-level tests
- `tests/integration/`: End-to-end generation tests
- `tests/e2e/`: CLI and GUI testing
- `tests/setup.ts`: Global test configuration

### Key Test Areas

- NLP parser accuracy for different input patterns
- Template engine variable substitution
- Script validation (syntax + security)
- Integration file generation
- CLI command handling

## Development Guidelines

### TypeScript Configuration

- Strict mode enabled with comprehensive type checking
- Path mapping for clean imports (`@core/*`, `@cli/*`, etc.)
- ES2020 target with CommonJS modules
- Source maps enabled for debugging

### Code Organization

- Core business logic in `src/core/`
- CLI interface separate in `src/cli/`
- Integration-specific code in `src/integrations/`
- Templates organized by language and complexity

### Error Handling

- Comprehensive error collection throughout pipeline
- Graceful degradation when components fail
- Detailed logging with Alsania-themed output
- Validation warnings that don't stop generation

### Dependency Management

- Minimal external dependencies aligned with Alsania principles
- No React/heavy frameworks (uses native Electron for GUI)
- Open-source libraries preferred
- NLP processing with `natural` and `compromise` libraries

## Project-Specific Patterns

### NLP Analysis Pipeline

The `EnhancedNLPParser` uses rule-based intent recognition:

- File operation detection (CSV processing → Python)
- System command detection (ls/cp → Bash)
- Integration keyword detection (nemo/kde → specific handlers)
- Complexity assessment based on mentioned technologies

### Template Variable Flow

Templates receive structured data from NLP analysis:

- `{{intent.primary}}`: Main action type
- `{{requirements.*}}`: File/network/GUI requirements
- `{{dependencies}}`: Required libraries/commands
- `{{alsaniaSignature}}`: Compliance metadata

### Integration File Generation

Each integration type generates specific auxiliary files:

- Nemo: `.nemo_action` + executable script
- KDE: Command definition + notification wrapper
- VS Code: `.code-snippets` with metadata

## Common Troubleshooting

### Build Issues

- `npm install` may need Node.js 16+
- Missing Python 3.8+ for integration scripts
- Template directory not found (check config paths)

### Generation Failures

- Enable debug mode: `scrypgen generate "desc" --debug`
- Check system health: `scrypgen health`
- Review NLP analysis confidence scores in logs

### Integration Problems

- Verify file permissions for generated scripts
- Check installation paths for desktop integrations
- Test with simple commands before complex ones

## File Organization Philosophy

Following Alsania principles, this project maintains:

- Clear separation between core logic and interfaces
- Modular components that can be independently tested
- Configuration-driven behavior with sensible defaults
- Rich metadata for debugging and introspection

The codebase is structured to be both developer-friendly and easily extensible, with each component having clear responsibilities and well-defined interfaces.
