# Publishing PHP-WASM Node with xdiff Support to NPM

This guide explains how to publish your fork of @php-wasm/node with xdiff support enabled. This package serves as a drop-in replacement for @php-wasm/node, providing all the same functionality plus xdiff support.

## Prerequisites

1. Node.js and npm installed
2. An npm account (create one at <https://www.npmjs.com/signup> if needed)
3. Successfully built PHP-WASM with xdiff support

## Step 1: Login to NPM

```bash
# Login to your npm account
npm login
```

Make sure you're logged in as your emdashcodes account.

## Step 2: Ensure Correct Branch

1. Make sure you're on the try/xdiff branch:

```bash
git checkout try/xdiff
git status  # Verify you're on the correct branch
```

## Step 3: Prepare the Package

1. Navigate to the node package directory and create a copy:

```bash
cd packages/php-wasm/node
cp -r . ../node-xdiff
cd ../node-xdiff

# Replace the PHP build with our xdiff-enabled version
rm -rf asyncify jspi  # Remove existing PHP builds
mkdir -p jspi
cp -r ../node/jspi/* jspi/  # Copy our xdiff-enabled build

# Update package.json with our details
# (package.json should already be updated with @emdashcodes scope and xdiff info)

# Verify the package structure
ls -la
# You should see:
# - All original @php-wasm/node files (src/, bin/, etc.)
# - jspi/ (directory with xdiff-enabled PHP build)
# - package.json (updated for @emdashcodes scope)
# - All TypeScript and build configuration files

# The package.json should be configured with:
{
  "name": "@emdashcodes/php-wasm-node",
  "version": "1.0.0",
  "description": "PHP-WASM for Node.js with xdiff support",
  "exports": {
    ".": {
      "import": "./index.js",
      "require": "./index.cjs"
    },
    "./package.json": "./package.json",
    "./README.md": "./README.md"
  },
  "type": "module",
  "main": "./index.cjs",
  "module": "./index.js",
  "types": "index.d.ts",
  "files": [
    "src",
    "index.js",
    "index.cjs",
    "index.d.ts",
    "jspi",
    "8_4",
    "README.md"
  ]
}
```

Note: This package is a complete drop-in replacement for @php-wasm/node, including all TypeScript definitions and module code.

## Step 4: Build and Test

1. Set up the package:

```bash
# First, copy the entire node package and its configuration
cd packages/php-wasm/node
cp -r . ../node-xdiff
cd ../node-xdiff

# Copy all necessary files
cp ../.eslintrc.json .
cp ../tsconfig.json .
cp ../tsconfig.lib.json .
cp ../tsconfig.spec.json .
cp ../vite.config.ts .
cp ../build.js .

# Copy source and TypeScript files
cp -r ../src .
cp -r ../bin .
cp ../index.d.ts .
cp ../tsconfig.json .
cp ../tsconfig.lib.json .
cp ../tsconfig.spec.json .

# Copy PHP build files and other configs

# Replace the PHP build with our xdiff-enabled version
rm -rf asyncify jspi  # Remove existing PHP builds
mkdir -p jspi
cp -r ../node/jspi/* jspi/  # Copy our xdiff-enabled build

# Return to project root and build
cd ../../../
npx nx build php-wasm-node-xdiff  # This builds TypeScript files using the nx workspace
```

Note: The build process will:

-   Generate TypeScript definitions
-   Copy all necessary files to dist/
-   Prepare the package for publishing

2. Test the build locally:

```bash
# Create a test PHP file
echo '<?php if(extension_loaded("xdiff")) echo "xdiff loaded!\n";' > test.php

# Run it using the local build
node bin/php.js test.php

# You should see "xdiff loaded!"
```

## Step 5: Publish the Package

1. Do a dry run to verify the package contents:

```bash
# See what files will be included
npm publish --dry-run

# The output should show:
# - All TypeScript files (src/, *.d.ts)
# - All runtime files (bin/, index.js, index.cjs)
# - The xdiff-enabled PHP build (jspi/)
# - Configuration files (package.json, tsconfig.json)
```

2. If everything looks good, publish:

```bash
npm publish --access public
```

## Step 6: Using the Published Package

In your other projects, you can now use this as a drop-in replacement for @php-wasm/node:

```javascript
// Instead of importing from @php-wasm/node, import from your package
import { loadNodeRuntime } from '@emdashcodes/php-wasm-node';

// Use it exactly like you would use @php-wasm/node
const runtime = await loadNodeRuntime();

// Test xdiff functionality
const result = await runtime.php.run({
	code: `<?php
    if (extension_loaded('xdiff')) {
        echo "xdiff is available!\\n";
    } else {
        echo "xdiff is not loaded\\n";
    }
    `,
});
console.log(result.text);
```

## Step 5: Updating the Package

When you need to publish updates:

1. Make your changes
2. Bump the version:

```bash
npm version patch  # For bug fixes
# or
npm version minor  # For new features
# or
npm version major  # For breaking changes
```

3. Publish the new version:

```bash
npm publish --access public
```

## Troubleshooting

### Common Issues

1. "You must be logged in to publish packages":

    - Run `npm login` again
    - Verify with `npm whoami`

2. "Package name already exists":

    - Make sure you're using your scope (@emdashcodes)
    - Check if the package name is available

3. "No files to publish":
    - Check your .npmignore file
    - Verify the compiled files are in the correct location

### Verifying the Published Package

After publishing, you can verify the package:

1. Create a new directory somewhere else
2. Initialize a new project:

```bash
mkdir test-php-wasm
cd test-php-wasm
npm init -y
```

3. Install your package:

```bash
npm install @emdashcodes/php-wasm-node
```

4. Create a test file (test.js):

```javascript
import { loadNodeRuntime } from '@emdashcodes/php-wasm-node';

async function test() {
	const runtime = await loadNodeRuntime();
	const result = await runtime.php.run({
		code: `<?php
        if (extension_loaded('xdiff')) {
            echo "xdiff is available!\\n";
        }
        `,
	});
	console.log(result.text);
}

test();
```

5. Run the test:

```bash
node test.js
```

## Support

If you encounter any issues:

1. Check the [npm documentation](https://docs.npmjs.com/cli/v8/commands/npm-publish)
2. File an issue on your fork's GitHub repository
3. Contact npm support if it's a publishing issue

## Notes

-   Keep your npm token secure and never commit it to version control
-   Consider setting up automated publishing with GitHub Actions for future updates
-   Remember to update the README.md with information about xdiff support
