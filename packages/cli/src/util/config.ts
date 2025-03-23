import yaml from 'js-yaml';
import fs from 'node:fs';
import path from 'node:path';

export type Config = {
	authority: string;
	connection: string;
	apispec: number;
	exclude: string[] | string;
	include: string[] | string;
};

export const makeConfig = (config: Partial<Config>, indent = 0): string => {
	return yaml.dump({ ...defaultConfig, ...config }, { indent });
};

export const readConfig = (config: string): Config => {
	return yaml.load(config) as Config;
};

export const defaultConfig: Config = {
	authority: '@onlynv/platform',
	connection: '',
	apispec: 1,
	exclude: ['**/*.local', '**/*.example'],
	include: ['**/.env*']
};

let hasWarned = false;

export const getConfig = (dir = process.cwd()): Config => {
	const configPath = path.join(dir, '.lnvrc');

	if (!fs.existsSync(configPath)) {
		if (hasWarned) return defaultConfig;
		hasWarned = true;
		console.warn("No '.lnvrc' file found in current directory.");
		console.warn('Using default configuration.');
		return defaultConfig;
	}

	try {
		return Object.assign(defaultConfig, readConfig(fs.readFileSync(configPath, 'utf-8')));
	} catch (e) {
		console.error('Failed to read config:', Error(e as string).message);
		return defaultConfig;
	}
};
