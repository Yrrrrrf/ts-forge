#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print with color
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Print step message
print_step() {
    print_color "$BLUE" "\n🦕 $1..."
}

# Print success message
print_success() {
    print_color "$GREEN" "✅ $1"
}

# Print error message and exit
print_error() {
    print_color "$RED" "❌ $1"
    exit 1
}

# Check if command exists
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 is required but not installed. Please install it first."
    fi
}

# Create deno.json configuration
create_deno_json() {
    local name=$1
    local version=$2
    
    cat > deno.json << EOF
{
  "name": "$name",
  "version": "$version",
  "exports": "./mod.ts",
  "tasks": {
    "dev": "deno run --watch mod.ts",
    "test": "deno test --allow-none",
    "lint": "deno lint",
    "fmt": "deno fmt"
  },
  "fmt": {
    "files": {
      "include": ["src/", "tests/", "mod.ts"]
    },
    "options": {
      "useTabs": false,
      "lineWidth": 80,
      "indentWidth": 2,
      "singleQuote": true
    }
  },
  "lint": {
    "files": {
      "include": ["src/", "tests/", "mod.ts"]
    },
    "rules": {
      "tags": ["recommended"]
    }
  },
  "test": {
    "files": {
      "include": ["tests/"]
    }
  },
  "publish": {
    "exclude": [
      ".git/",
      ".github/",
      ".vscode/",
      "tests/",
      "examples/",
      "*.test.ts",
      "*.md",
      "!README.md"
    ]
  },
  "compilerOptions": {
    "strict": true,
    "allowJs": false,
    "checkJs": false,
    "lib": ["deno.window", "deno.unstable"]
  }
}
EOF
}

# Create import_map.json
create_import_map() {
    cat > import_map.json << 'EOF'
{
  "imports": {
    "@/": "./src/",
    "@test/": "./tests/"
  }
}
EOF
}

# Create mod.ts (main entry point)
create_mod() {
    cat > mod.ts << 'EOF'
export * from "./src/main.ts";
EOF
}

# Create main source file
create_main_source() {
    mkdir -p src
    cat > src/main.ts << 'EOF'
/**
 * A simple greeting function.
 * @param name The name to greet
 * @returns A greeting message
 */
export function hello(name: string): string {
  return `Hello, ${name}!`;
}

if (import.meta.main) {
  console.log(hello("Deno"));
}
EOF
}

# Create sample test file
create_test() {
    mkdir -p tests
    cat > tests/main_test.ts << 'EOF'
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { hello } from "../src/main.ts";

Deno.test("hello function", async (t) => {
  await t.step("returns correct greeting", () => {
    const result = hello("Deno");
    assertEquals(result, "Hello, Deno!");
  });
});
EOF
}

# Create README.md
create_readme() {
    local name=$1
    local description=$2
    
    cat > README.md << EOF
# $name

$description

## Features

- 🦕 Built for Deno
- 📦 Available in Deno 2.0 Store
- 🔒 Type-safe
- 📝 Well documented

## Installation

You can use this module in several ways:

### Deno 2.0 Store

\`\`\`typescript
import { hello } from "jsr:@username/$name";
\`\`\`

### Direct URL

\`\`\`typescript
import { hello } from "https://deno.land/x/$name/mod.ts";
\`\`\`

## Usage

\`\`\`typescript
import { hello } from "jsr:@username/$name";

console.log(hello("World")); // Output: Hello, World!
\`\`\`

## API Documentation

### hello(name: string): string

Returns a greeting message with the provided name.

## Development

### Prerequisites

- [Deno](https://deno.land/) installed on your machine

### Running locally

\`\`\`bash
# Run the module
deno run mod.ts

# Run with watch mode
deno task dev

# Run tests
deno task test

# Format code
deno task fmt

# Lint code
deno task lint
\`\`\`

## Publishing

1. Update version in deno.json
2. Run tests and ensure everything passes
3. Publish to Deno 2.0 Store:

\`\`\`bash
deno publish
\`\`\`

## License

MIT License - see the LICENSE file for details.
EOF
}

# Create .gitignore
create_gitignore() {
    cat > .gitignore << 'EOF'
# Deno specific
.deno/
deno.lock

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.DS_Store
EOF
}

# Create VSCode settings
create_vscode_settings() {
    mkdir -p .vscode
    cat > .vscode/settings.json << 'EOF'
{
  "deno.enable": true,
  "deno.lint": true,
  "deno.unstable": false,
  "[typescript]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  },
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true
  }
}
EOF
}

# Create LICENSE
create_license() {
    local year=$(date +%Y)
    local author=$1
    
    cat > LICENSE << EOF
MIT License

Copyright (c) $year $author

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
}

# Main script
main() {
    # Check required commands
    check_command "deno"
    check_command "git"

    # Get package information
    print_step "Setting up new Deno package"
    read -p "Enter package name: " package_name
    read -p "Enter package description: " package_description
    read -p "Enter package version (e.g., 1.0.0): " package_version
    read -p "Enter author name: " package_author

    # Create directory and navigate into it
    mkdir -p "$package_name"
    cd "$package_name" || print_error "Failed to create directory"

    # Initialize git
    print_step "Initializing Git repository"
    git init

    # Create files
    print_step "Creating package files"
    create_deno_json "$package_name" "$package_version"
    create_import_map
    create_mod
    create_main_source
    create_test
    create_readme "$package_name" "$package_description"
    create_gitignore
    create_vscode_settings
    create_license "$package_author"

    # Initialize deno project
    print_step "Initializing Deno configuration"
    deno cache --reload mod.ts

    # Run initial format
    print_step "Formatting code"
    deno fmt

    print_success "Deno package setup completed!"
    print_color "$YELLOW" "\nNext steps:"
    echo "1. cd $package_name"
    echo "2. Update package details in deno.json"
    echo "3. Write your code in src/"
    echo "4. Write tests in tests/"
    echo "5. Run 'deno task test' to test"
    echo "6. Run 'deno task fmt' to format"
    echo "7. Run 'deno task lint' to lint"
    echo "8. Run 'deno publish' to publish to Deno 2.0 Store"
    echo -e "\n${GREEN}Documentation:${NC}"
    echo "- Deno: https://deno.land/manual"
    echo "- Deno 2.0 Store: https://jsr.io"
}

# Run main function
main
