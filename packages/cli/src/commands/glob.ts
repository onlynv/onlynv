import pc from '@onlynv/shared/colors';
import { fdir } from 'fdir';
import picomatch from 'picomatch';

import type { Interface } from '../interface';
import { getConfig } from '../util/config';
import { resolveWorkspace } from '../util/workspace';

export default async (int: Interface, log = true) => {
	const workspace = resolveWorkspace();

	if (!workspace) {
		if (log) console.error(pc.red('No workspace found.'));
		return;
	}

	const config = getConfig(workspace);

	if (log) console.log(pc.yellow('Globbing files...'));

	if (log) console.log();

	const files = await new fdir()
		.withGlobFunction(picomatch)
		.withBasePath()
		.globWithOptions(Array.isArray(config.include) ? config.include : [config.include], {
			ignore: config.exclude,
			dot: true
		})
		.crawl(workspace)
		.withPromise();

	if (log) console.log(files.map((file) => file.replace(workspace + '/', '')).join('\n'));

	if (!files || !files.length) {
		if (log) console.log(pc.red('No files found'));
		return;
	}

	return files;
};
