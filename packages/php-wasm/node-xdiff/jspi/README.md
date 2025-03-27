# @emdashcodes/php-wasm-node

A drop-in replacement for @php-wasm/node with xdiff support enabled. This package provides everything from the original @php-wasm/node package plus the xdiff extension for performing file and string difference operations.

## Installation

```bash
npm install @emdashcodes/php-wasm-node
```

## Usage

```javascript
import { loadNodeRuntime } from '@emdashcodes/php-wasm-node';

// Use it just like @php-wasm/node, but now with xdiff support
const runtime = await loadNodeRuntime();

// Test xdiff functionality
const result = await runtime.php.run({
	code: `<?php
    if (extension_loaded('xdiff')) {
        echo "xdiff is available!\n";
        
        // Example: Create a diff between two strings
        $old_text = "This is a test\nfor the xdiff\nextension.";
        $new_text = "This is a test\nfor the awesome xdiff\nextension!";
        
        // Create a unified diff
        $diff = xdiff_string_diff($old_text, $new_text);
        echo "Diff created: " . (strlen($diff) > 0 ? "Yes" : "No") . "\n";
        echo "Diff content:\n$diff\n";
        
        // Apply the patch
        $patched = xdiff_string_patch($old_text, $diff);
        echo "Patched text matches new text: " . 
             ($patched === $new_text ? "Yes" : "No") . "\n";
    } else {
        echo "xdiff is not loaded!\n";
    }
    `,
});

console.log(result.text);
```

## Features

-   Full PHP 8.4 support
-   xdiff extension enabled
-   JSPI (JavaScript Promise Integration) support
-   Compatible with both Node.js and browser environments

## Available xdiff Functions

-   `xdiff_string_diff()` - Create a diff between two strings
-   `xdiff_string_patch()` - Apply a diff to a string
-   `xdiff_string_bdiff()` - Create a binary diff
-   `xdiff_string_bpatch()` - Apply a binary diff
-   And more - see the [PHP xdiff documentation](https://www.php.net/manual/en/book.xdiff.php)

## Building from Source

This package is built from the `try/xdiff` branch which includes the xdiff extension support. If you want to build it from source:

1. Clone the repository and switch to the correct branch:

```bash
git clone https://github.com/emdashcodes/wordpress-playground.git
cd wordpress-playground
git checkout try/xdiff  # Important: Make sure you're on this branch
```

2. Install dependencies:

```bash
npm install
```

3. Build PHP with xdiff support:

```bash
# Verify you're on the correct branch
git status  # Should show you're on try/xdiff branch

# Build the package
npx nx recompile-php:all php-wasm-node --WITH_XDIFF=yes
```

Note: The xdiff support is only available in the `try/xdiff` branch. The main branch does not include this functionality.

## License

GPL-2.0-or-later

## Contributing

Feel free to open issues and pull requests in the [GitHub repository](https://github.com/emdashcodes/wordpress-playground).
