import type { Interface } from '../interface';
import { getConfig } from '../util/config';

import pc from '@onlynv/shared/colors';

import glob from 'fast-glob';

export default async (int: Interface, log = true) => {
	const config = getConfig();

	if (log) console.log(pc.yellow('Globbing files...'));

	if (log) console.log();

	const files = await glob(config.include, {
		ignore: Array.isArray(config.exclude) ? config.exclude : [config.exclude]
	});

	if (log) console.log(files.join('\n'));

	return files;
};
