import yaml from 'js-yaml';

type Config = {
	authority: string;
	connection: string;
	apispec: number;
	exclude: string[] | string;
	include: string[] | string;
};

export const makeConfig = (config: Partial<Config>, indent = 0): string => {
	return yaml.dump(config, { indent });
};

export const readConfig = (config: string): Config => {
	return yaml.load(config) as Config;
};
