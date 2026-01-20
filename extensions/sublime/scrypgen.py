"""
ScrypGen Sublime Text Plugin
Integrates ScrypGen script generation into Sublime Text
Alsania Protocol v1.0 - Built by Sigma, Powered by Echo
"""

import sublime
import sublime_plugin  # type: ignore
import subprocess
import os
import re


class ScrypgenGenerateScriptCommand(sublime_plugin.WindowCommand):
    """
    Command to generate scripts from natural language descriptions
    """

    def run(self):
        # Show input panel for description
        self.window.show_input_panel(
            "Describe the script you want to generate:",
            "",
            self.on_description_entered,
            None,
            None
        )

    def on_description_entered(self, description):
        if not description.strip():
            return

        self.description = description

        # Show quick panel for language selection
        self.window.show_quick_panel(
            ['Auto Detect', 'Python', 'Bash'],
            self.on_language_selected,
            sublime.MONOSPACE_FONT  # type: ignore
        )

    def on_language_selected(self, index):
        if index == -1:  # Cancelled
            return

        languages = ['auto', 'python', 'bash']
        self.language = languages[index]

        # Show status message
        sublime.status_message('Generating script with ScrypGen...')  # type: ignore

        # Run scrypgen in background
        sublime.set_timeout_async(lambda: self.generate_script(), 0)  # type: ignore

    def generate_script(self):
        try:
            # Execute scrypgen command
            script_code = self.execute_scrypgen(self.description, self.language)

            # Create new view with generated script
            view = self.window.new_file()

            # Set syntax based on language
            if self.language == 'python':
                view.set_syntax_file('Packages/Python/Python.sublime-syntax')
            elif self.language == 'bash':
                view.set_syntax_file('Packages/ShellScript/Shell-Unix-Generic.sublime-syntax')
            else:
                # Auto-detect based on content
                if script_code.startswith('#!/usr/bin/env python') or 'import ' in script_code:
                    view.set_syntax_file('Packages/Python/Python.sublime-syntax')
                elif script_code.startswith('#!/bin/bash') or script_code.startswith('#!/usr/bin/env bash'):
                    view.set_syntax_file('Packages/ShellScript/Shell-Unix-Generic.sublime-syntax')

            # Insert the generated script
            view.run_command('insert', {'characters': script_code})

            sublime.status_message('Script generated successfully!')  # type: ignore

        except Exception as e:
            sublime.error_message(f'ScrypGen generation failed: {str(e)}')  # type: ignore

    def execute_scrypgen(self, description, language):
        """
        Execute ScrypGen CLI command and return generated script
        """
        # Build command arguments
        cmd = ['scrypgen', 'generate', f'"{description}"']

        if language != 'auto':
            cmd.extend(['--language', language])

        # Get current project directory
        project_dir = self.get_project_directory()

        # Execute command
        result = subprocess.run(
            cmd,
            cwd=project_dir,
            shell=True,
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise Exception(result.stderr or f'Command failed with code {result.returncode}')

        # Extract script code from output
        return self.extract_script_code(result.stdout)

    def extract_script_code(self, output):
        """
        Extract the actual script code from scrypgen output
        """
        lines = output.split('\n')
        script_lines = []
        in_script = False

        for line in lines:
            # Look for script start markers
            if not in_script:
                if (line.startswith('#!/') or
                    'import ' in line or
                    line.strip().startswith('# ') or
                    re.match(r'^\s*def\s+', line) or
                    re.match(r'^\s*function\s+', line)):
                    in_script = True

            if in_script:
                script_lines.append(line)

        return '\n'.join(script_lines).strip()

    def get_project_directory(self):
        """
        Get the current project directory
        """
        # Try to get from window folders
        folders = self.window.folders()
        if folders:
            return folders[0]

        # Fallback to current file directory
        view = self.window.active_view()
        if view and view.file_name():
            return os.path.dirname(view.file_name())

        # Final fallback
        return os.getcwd()


class ScrypgenGenerateScriptFromSelectionCommand(sublime_plugin.WindowCommand):
    """
    Command to generate scripts from selected text
    """

    def run(self):
        view = self.window.active_view()
        if not view:
            sublime.error_message("No active view found")  # type: ignore
            return

        selection = view.sel()
        if not selection or selection[0].empty():
            sublime.error_message("No text selected")  # type: ignore
            return

        selected_text = view.substr(selection[0])
        if not selected_text.strip():
            sublime.error_message("Selection is empty")  # type: ignore
            return

        self.description = selected_text

        # Show quick panel for language selection
        self.window.show_quick_panel(
            ['Auto Detect', 'Python', 'Bash'],
            self.on_language_selected,
            sublime.MONOSPACE_FONT  # type: ignore
        )

    def on_language_selected(self, index):
        if index == -1:  # Cancelled
            return

        languages = ['auto', 'python', 'bash']
        self.language = languages[index]

        # Show status message
        sublime.status_message('Generating script with ScrypGen...')  # type: ignore

        # Run scrypgen in background
        sublime.set_timeout_async(lambda: self.generate_script(), 0)  # type: ignore

    def generate_script(self):
        try:
            # Execute scrypgen command
            script_code = self.execute_scrypgen(self.description, self.language)

            # Create new view with generated script
            view = self.window.new_file()

            # Set syntax based on language
            if self.language == 'python':
                view.set_syntax_file('Packages/Python/Python.sublime-syntax')
            elif self.language == 'bash':
                view.set_syntax_file('Packages/ShellScript/Shell-Unix-Generic.sublime-syntax')
            else:
                # Auto-detect based on content
                if script_code.startswith('#!/usr/bin/env python') or 'import ' in script_code:
                    view.set_syntax_file('Packages/Python/Python.sublime-syntax')
                elif script_code.startswith('#!/bin/bash') or script_code.startswith('#!/usr/bin/env bash'):
                    view.set_syntax_file('Packages/ShellScript/Shell-Unix-Generic.sublime-syntax')

            # Insert the generated script
            view.run_command('insert', {'characters': script_code})

            sublime.status_message('Script generated successfully!')  # type: ignore

        except Exception as e:
            sublime.error_message(f'ScrypGen generation failed: {str(e)}')  # type: ignore

    def execute_scrypgen(self, description, language):
        """
        Execute ScrypGen CLI command and return generated script
        """
        # Build command arguments
        cmd = ['scrypgen', 'generate', f'"{description}"']

        if language != 'auto':
            cmd.extend(['--language', language])

        # Get current project directory
        project_dir = self.get_project_directory()

        # Execute command
        result = subprocess.run(
            cmd,
            cwd=project_dir,
            shell=True,
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            raise Exception(result.stderr or f'Command failed with code {result.returncode}')

        # Extract script code from output
        return self.extract_script_code(result.stdout)

    def extract_script_code(self, output):
        """
        Extract the actual script code from scrypgen output
        """
        lines = output.split('\n')
        script_lines = []
        in_script = False

        for line in lines:
            # Look for script start markers
            if not in_script:
                if (line.startswith('#!/') or
                    'import ' in line or
                    line.strip().startswith('# ') or
                    re.match(r'^\s*def\s+', line) or
                    re.match(r'^\s*function\s+', line)):
                    in_script = True

            if in_script:
                script_lines.append(line)

        return '\n'.join(script_lines).strip()

    def get_project_directory(self):
        """
        Get the current project directory
        """
        # Try to get from window folders
        folders = self.window.folders()
        if folders:
            return folders[0]

        # Fallback to current file directory
        view = self.window.active_view()
        if view and view.file_name():
            return os.path.dirname(view.file_name())

        # Final fallback
        return os.getcwd()


class ScrypgenShowMenuCommand(sublime_plugin.WindowCommand):
    """
    Show ScrypGen menu
    """

    def run(self):
        menu_items = [
            'Generate Script from Description',
            'Generate Script from Selection',
            'About ScrypGen'
        ]

        self.window.show_quick_panel(
            menu_items,
            self.on_menu_selected,
            sublime.MONOSPACE_FONT  # type: ignore
        )

    def on_menu_selected(self, index):
        if index == 0:
            self.window.run_command('scrypgen_generate_script')
        elif index == 1:
            self.window.run_command('scrypgen_generate_script_from_selection')
        elif index == 2:
            self.show_about()

    def show_about(self):
        about_text = """
ScrypGen - Transform Ideas into Code
Alsania Protocol v1.0
Built by Sigma, Powered by Echo

Transform natural language descriptions into
production-ready Python and Bash scripts.
"""
        sublime.message_dialog(about_text)  # type: ignore