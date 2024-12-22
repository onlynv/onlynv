import { argv } from 'process';

import type { Config } from './config';

const URL =
	process.env.npm_lifecycle_script || argv.includes('DEV') ?
		'http://localhost:3000'
	:	'https://onlynv.dev';

const official = ['@onlynv/platform', '@onlynv/cli'];

export const getAuthority = (config: Partial<Config>) => {
	if (official.includes(config.authority || '')) {
		return URL;
	}

	return config.authority || URL;
};
