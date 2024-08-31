import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parse, type DotenvParseOutput } from './parse';

export interface DotenvConfigOptions {
	path?: string | string[] | URL;
	encoding?: BufferEncoding;
	debug?: boolean;
	override?: boolean;
	processEnv?: DotenvPopulateInput;
	/**
	 * @since Node.js v22.0.0
	 *
	 * When enabled, will search for all `.env*` files in the current working directory and its subdirectories.
	 */
	experimentalGlob?: boolean;
}

export interface DotenvConfigOutput {
	error?: Error;
	parsed?: DotenvParseOutput;
}

export interface DotenvPopulateInput {
	[name: string]: string | undefined;
}

const canGlob = parseInt(process.version.substring(1, 3)) >= 22;

export const config = (options?: DotenvConfigOptions): DotenvConfigOutput => {
	const opts: Required<Omit<DotenvConfigOptions, `experimental${string}`>> = {
		path:
			options?.path ||
			(canGlob && options?.experimentalGlob ?
				require('node:fs').globSync('./**/.env*')
			:	resolve(process.cwd(), '.env')),
		encoding: options?.encoding || 'utf8',
		debug: options?.debug || false,
		override: options?.override || false,
		processEnv: options?.processEnv || process.env
	};

	const paths = Array.isArray(opts.path) ? opts.path : [opts.path];

	const parsedAll: DotenvParseOutput = {};

	for (let path of paths) {
		if (!path) {
			return { error: new Error('Path is required') };
		}

		if (!(path instanceof URL) && !path.startsWith('/')) {
			path = resolve(process.cwd(), path);
		}

		try {
			const parsed = parse(readFileSync(path, { encoding: opts.encoding }));

			Object.assign(parsedAll, parsed);
		} catch (e) {
			return { error: e as Error };
		}
	}

	if (opts.override) {
		Object.assign(opts.processEnv, parsedAll);
	} else {
		for (let key in parsedAll) {
			if (!(key in opts.processEnv)) {
				if (opts.debug) {
					console.log(`Setting ${key} to ${parsedAll[key]}`);
				}

				opts.processEnv[key] = parsedAll[key];
			}
		}
	}

	return { parsed: parsedAll };
};
