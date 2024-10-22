import pc from '@onlynv/shared/colors';
import { fdir } from 'fdir';
import { createSpinner } from 'nanospinner';
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

	const spinner = createSpinner(pc.yellow('Globbing files...'));

	if (log) spinner.start();

	const files = await new fdir()
		.withGlobFunction(picomatch)
		.withBasePath()
		.globWithOptions(Array.isArray(config.include) ? config.include : [config.include], {
			ignore: config.exclude,
			dot: true
		})
		.crawl(workspace)
		.withPromise();

	if (!files || !files.length) {
		if (log) spinner.error({ text: pc.red('No files found') });
		return;
	} else {
		if (log)
			spinner.success({
				text: pc.green(`Found ${files.length} files`)
			});
	}

	if (log)
		console.log(files.map((file) => '    ' + file.replace(workspace + '/', '')).join('\n'));

	return files;
};
