/**
 * Script Validator for Universal Script Generator
 * Alsania aligned - built by Sigma, powered by Echo
 */

import { ValidationResult, Logger } from './types';
import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';

export class ScriptValidator {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async validateScript(code: string, language: 'python' | 'bash'): Promise<ValidationResult> {
    try {
      this.logger.debug('Validating script', { language, codeLength: code.length });

      const syntaxErrors = await this.checkSyntax(code, language);
      const securityWarnings = this.checkSecurityIssues(code, language);
      const recommendations = this.generateRecommendations(code, language);

      const result: ValidationResult = {
        isValid: syntaxErrors.length === 0,
        syntaxErrors,
        securityWarnings,
        recommendations
      };

      this.logger.debug('Validation complete', {
        isValid: result.isValid,
        errorCount: syntaxErrors.length,
        warningCount: securityWarnings.length
      });

      return result;
    } catch (error) {
      this.logger.error('Validation failed', error);
      return {
        isValid: false,
        syntaxErrors: [`Validation error: ${error}`],
        securityWarnings: [],
        recommendations: []
      };
    }
  }

  private async checkSyntax(code: string, language: 'python' | 'bash'): Promise<string[]> {
    const errors: string[] = [];

    try {
      if (language === 'python') {
        // Create temporary Python file
        const tempFile = path.join('/tmp', `script_validation_${Date.now()}.py`);
        await fs.writeFile(tempFile, code);

        // Check Python syntax
        const result = await this.runCommand('python3', ['-m', 'py_compile', tempFile]);
        
        if (result.exitCode !== 0) {
          errors.push(`Python syntax error: ${result.stderr}`);
        }

        // Cleanup
        await fs.remove(tempFile);
      } else if (language === 'bash') {
        // Create temporary bash file
        const tempFile = path.join('/tmp', `script_validation_${Date.now()}.sh`);
        await fs.writeFile(tempFile, code);

        // Check bash syntax
        const result = await this.runCommand('bash', ['-n', tempFile]);
        
        if (result.exitCode !== 0) {
          errors.push(`Bash syntax error: ${result.stderr}`);
        }

        // Cleanup
        await fs.remove(tempFile);
      }
    } catch (error) {
      this.logger.warn('Could not perform syntax validation', { language, error });
    }

    return errors;
  }

  private checkSecurityIssues(code: string, language: 'python' | 'bash'): string[] {
    const warnings: string[] = [];

    // Common security patterns
    const dangerousPatterns = {
      'eval usage': /\beval\s*\(/g,
      'exec usage': /\bexec\s*\(/g,
      'shell injection risk': /shell\s*=\s*True/g,
      'subprocess with shell': /subprocess.*shell\s*=\s*True/g,
      'rm -rf usage': /rm\s+-rf\s+/g,
      'sudo usage': /sudo\s+/g,
      'password in plaintext': /password\s*=\s*["'][^"']+["']/gi,
      'hardcoded credentials': /(api_key|secret|token)\s*=\s*["'][^"']+["']/gi
    };

    for (const [issue, pattern] of Object.entries(dangerousPatterns)) {
      if (pattern.test(code)) {
        warnings.push(`Security warning: Detected ${issue}`);
      }
    }

    // Language-specific security checks
    if (language === 'python') {
      if (code.includes('pickle.loads') || code.includes('pickle.load')) {
        warnings.push('Security warning: Pickle deserialization can be dangerous');
      }
      
      if (code.includes('input(') && !code.includes('# safe input')) {
        warnings.push('Security warning: Raw input() usage - consider validation');
      }
    } else if (language === 'bash') {
      if (code.includes('$(') && !code.includes('# safe command substitution')) {
        warnings.push('Security warning: Command substitution - ensure input validation');
      }

      if (code.includes('cat /etc/passwd') || code.includes('cat /etc/shadow')) {
        warnings.push('Security warning: Accessing sensitive system files');
      }
    }

    return warnings;
  }

  private generateRecommendations(code: string, language: 'python' | 'bash'): string[] {
    const recommendations: string[] = [];

    // General recommendations
    if (!code.includes('try:') && !code.includes('except') && language === 'python') {
      recommendations.push('Consider adding error handling with try/except blocks');
    }

    if (!code.includes('logging') && !code.includes('print')) {
      recommendations.push('Consider adding logging for better debugging');
    }

    // Language-specific recommendations
    if (language === 'python') {
      if (!code.includes('if __name__ == "__main__":')) {
        recommendations.push('Consider adding main guard for better module structure');
      }

      if (!code.includes('docstring') && !code.includes('"""')) {
        recommendations.push('Consider adding docstrings for better documentation');
      }

      if (code.includes('import *')) {
        recommendations.push('Avoid wildcard imports - import specific functions instead');
      }
    } else if (language === 'bash') {
      if (!code.includes('set -e')) {
        recommendations.push('Consider adding "set -e" for better error handling');
      }

      if (!code.includes('#!/usr/bin/env bash') && !code.includes('#!/bin/bash')) {
        recommendations.push('Add proper shebang line for better portability');
      }

      if (code.includes('$1') && !code.includes('$#')) {
        recommendations.push('Consider checking argument count before using positional parameters');
      }
    }

    // Alsania compliance
    if (!code.includes('Alsania') && !code.includes('Sigma') && !code.includes('Echo')) {
      recommendations.push('Consider adding Alsania compliance markers for project alignment');
    }

    return recommendations;
  }

  private async runCommand(command: string, args: string[]): Promise<{ exitCode: number; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { stdio: 'pipe' });
      
      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({
          exitCode: code || 0,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      });

      process.on('error', (error) => {
        reject(error);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        process.kill('SIGKILL');
        reject(new Error('Command timeout'));
      }, 10000);
    });
  }

  async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    const checks = {
      python: false,
      bash: false,
      tempDir: false
    };

    try {
      // Check Python availability
      const pythonResult = await this.runCommand('python3', ['--version']);
      checks.python = pythonResult.exitCode === 0;

      // Check Bash availability
      const bashResult = await this.runCommand('bash', ['--version']);
      checks.bash = bashResult.exitCode === 0;

      // Check temp directory access
      const tempDir = '/tmp';
      checks.tempDir = await fs.pathExists(tempDir) && (await fs.stat(tempDir)).isDirectory();

      const healthy = Object.values(checks).every(check => check);

      return {
        healthy,
        details: {
          ...checks,
          message: healthy ? 'All validation tools available' : 'Some validation tools missing'
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error, checks }
      };
    }
  }
}