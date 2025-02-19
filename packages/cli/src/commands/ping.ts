import pc from '@onlynv/shared/colors';
import { createSpinner } from 'nanospinner';

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

	const spinner = createSpinner(pc.yellow(`Pinging ${authority}...`));

	spinner.start();

	let online = false;

	const now = performance.now();

	try {
		const res = await fetch(authority + '/api/ping');

		const time = performance.now() - now;

		if (res instanceof Error) {
			spinner.error({
				text: pc.red('Failed to ping')
			});
		}

		if (res.ok) {
			spinner.success({
				text: pc.green('Pong!' + (time > 0 ? ` (${time.toFixed(2)}ms)` : ''))
			});

			online = true;
		} else {
			spinner.error({
				text: pc.red('Failed to ping')
			});
		}
	} catch (e) {
		spinner.error({
			text: pc.red('Failed to ping')
		});
	}

	console.log();

	console.log(pc.yellow(`${authority} is ${online ? 'online' : 'offline'}`));
};
