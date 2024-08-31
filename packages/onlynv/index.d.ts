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

export function config(options?: DotenvConfigOptions): DotenvConfigOutput;
