import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

try {
	fs.mkdirSync('dist/packages/php-wasm/node-xdiff', { recursive: true });
} catch (e) {
	// Ignore
}

/**
 * This is a naive, best effort dirname/filename replacement plugin.
 *
 * In the repo, php.js files are stored in php_wasm/node-xdiff/jspi.
 * They start with a line like this:
 *
 * const dependencyFilename = __dirname + '/8_0_30/php_8_0.wasm';
 *
 * After the build, the contents are concatenated into a single file, which
 * breaks the dependencyFilename variable. This plugin corrects that by
 * replacing __dirname with the correct value such as 'jspi'.
 */
const dirnamePlugin = {
	name: 'dirname',
	setup(build) {
		build.onLoad({ filter: /\/php_\d+_\d+\.js$/ }, ({ path: filePath }) => {
			if (!filePath.match(/node_modules/)) {
				let contents = fs.readFileSync(filePath, 'utf8');
				const loader = path.extname(filePath).substring(1);
				const dirname = 'jspi'; // We only use jspi for xdiff build
				contents = contents.replaceAll(
					'__dirname',
					`__dirname + ${JSON.stringify(dirname)}`
				);
				return {
					contents,
					loader,
				};
			}
		});
	},
};

async function build() {
	await esbuild.build({
		entryPoints: [
			'packages/php-wasm/node-xdiff/src/index.ts',
			'packages/php-wasm/node-xdiff/src/noop.ts',
		],
		supported: {
			'dynamic-import': false,
		},
		outExtension: { '.js': '.cjs' },
		outdir: 'dist/packages/php-wasm/node-xdiff',
		platform: 'node',
		assetNames: '[name]',
		chunkNames: '[name]',
		logOverride: {
			'commonjs-variable-in-esm': 'silent',
		},
		format: 'cjs',
		bundle: true,
		tsconfig: 'packages/php-wasm/node-xdiff/tsconfig.json',
		external: ['@php-wasm/*', '@wp-playground/*', 'ws'],
		loader: {
			'.php': 'text',
			'.ini': 'file',
			'.wasm': 'file',
		},
		plugins: [dirnamePlugin],
	});

	await esbuild.build({
		entryPoints: [
			'packages/php-wasm/node-xdiff/src/index.ts',
			'packages/php-wasm/node-xdiff/src/noop.ts',
		],
		banner: {
			js: `import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;
const __filename = new URL(import.meta.url).pathname;
`,
		},
		outdir: 'dist/packages/php-wasm/node-xdiff',
		platform: 'node',
		assetNames: '[name]',
		chunkNames: '[name]',
		logOverride: {
			'commonjs-variable-in-esm': 'silent',
		},
		packages: 'external',
		bundle: true,
		tsconfig: 'packages/php-wasm/node-xdiff/tsconfig.json',
		external: ['@php-wasm/*', '@wp-playground/*', 'ws', 'fs', 'path'],
		supported: {
			'dynamic-import': true,
			'top-level-await': true,
		},
		format: 'esm',
		loader: {
			'.php': 'text',
			'.ini': 'file',
			'.wasm': 'file',
		},
		plugins: [dirnamePlugin],
	});

	fs.copyFileSync(
		'packages/php-wasm/node-xdiff/README.md',
		'dist/packages/php-wasm/node-xdiff/README.md'
	);

	// Copy package.json to dist
	fs.copyFileSync(
		'packages/php-wasm/node-xdiff/package.json',
		'dist/packages/php-wasm/node-xdiff/package.json'
	);
}
build();
