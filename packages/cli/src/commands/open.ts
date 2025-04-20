import pc from '@onlynv/shared/colors';
import { basename } from 'node:path';
import open from 'open';

import type { Interface } from '../interface';
import { getAuthority } from '../util/authority';
import { getConfig } from '../util/config';
import { resolveWorkspace } from '../util/workspace';

export default async (int: Interface) => {
	const workspace = resolveWorkspace();

	if (!workspace) {
		console.error(pc.red('No workspace found.'));
		return;
	}

	const config = getConfig(workspace);

	const authority = getAuthority(config);

	open(new URL(`/projects/${config.connection}`, authority).toString());

	console.log(pc.green(`Opened ${basename(workspace)} (${config.connection}) in browser`));
};
