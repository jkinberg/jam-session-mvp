#!/usr/bin/env python3
"""
Build script for Jam Session MVP
Reads environment variables from .env and generates HTML files from templates.
"""

import os
import sys
from pathlib import Path


def load_env():
    """Load environment variables from .env file or system environment"""
    env_vars = {}

    # First, try to load from system environment (for Vercel/CI)
    if 'ABLY_API_KEY' in os.environ:
        print("✓ Loading from system environment variables (Vercel/CI mode)")
        env_vars['ABLY_API_KEY'] = os.environ['ABLY_API_KEY']
        # Also check for optional GA4 measurement ID
        if 'GA4_MEASUREMENT_ID' in os.environ:
            env_vars['GA4_MEASUREMENT_ID'] = os.environ['GA4_MEASUREMENT_ID']
        return env_vars

    # Fall back to .env file (for local development)
    env_file = Path('.env')

    if not env_file.exists():
        print("❌ Error: .env file not found and no environment variables set!")
        print("\nPlease create a .env file:")
        print("  1. Copy .env.example to .env")
        print("  2. Add your Ably API key to the .env file")
        print("\nExample:")
        print("  cp .env.example .env")
        print("  # Then edit .env and add your API key")
        sys.exit(1)

    print("✓ Loading from .env file (local mode)")
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue
            # Parse KEY=VALUE
            if '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()

    return env_vars


def build_html_file(template_path, output_path, env_vars):
    """Generate HTML file from template by replacing placeholders"""
    template_file = Path(template_path)

    if not template_file.exists():
        print(f"❌ Error: Template file not found: {template_path}")
        sys.exit(1)

    # Read template
    with open(template_file, 'r') as f:
        content = f.read()

    # Replace placeholders
    for key, value in env_vars.items():
        placeholder = f'__{key}__'
        if placeholder in content:
            content = content.replace(placeholder, value)
            print(f"  ✓ Replaced {placeholder}")

    # Write output
    with open(output_path, 'w') as f:
        f.write(content)

    print(f"✅ Generated: {output_path}")


def main():
    print("🎵 Building Jam Session files...\n")

    # Load environment variables
    print("📂 Loading .env file...")
    env_vars = load_env()

    # Check for required variables
    if 'ABLY_API_KEY' not in env_vars:
        print("❌ Error: ABLY_API_KEY not found in .env file!")
        sys.exit(1)

    if env_vars['ABLY_API_KEY'] == 'your_ably_api_key_here':
        print("❌ Error: Please set your actual Ably API key in .env file!")
        sys.exit(1)

    print(f"✓ Found ABLY_API_KEY")

    # Check for optional GA4 measurement ID
    if 'GA4_MEASUREMENT_ID' in env_vars and env_vars['GA4_MEASUREMENT_ID'] != 'G-XXXXXXXXXX':
        print(f"✓ Found GA4_MEASUREMENT_ID (analytics enabled)")
    else:
        print("ℹ GA4_MEASUREMENT_ID not set (analytics disabled)")
        # Set empty value so placeholder replacement still works
        env_vars['GA4_MEASUREMENT_ID'] = ''

    print()

    # Build HTML files
    print("🔨 Building HTML files from templates...")
    build_html_file('host.template.html', 'host.html', env_vars)
    build_html_file('play.template.html', 'play.html', env_vars)

    # Also generate index.html from host template (for root URL access)
    build_html_file('host.template.html', 'index.html', env_vars)

    print("\n✨ Build complete!")
    print("\nYou can now run the server:")
    print("  python3 -m http.server 8000")
    print("  - Host screen: http://localhost:8000/ or http://localhost:8000/host.html")


if __name__ == '__main__':
    main()
