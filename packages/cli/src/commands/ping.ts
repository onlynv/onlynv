import pc from '@onlynv/shared/colors';
import { createSpinner } from 'nanospinner';

import type { Interface } from '../interface';
import { getAuthority } from '../util/authority';
import { getConfig } from '../util/config';
import { getKey } from '../util/storage';
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

	const bearer = getKey(config.connection, 'bearer');

	try {
		const res = await fetch(authority + '/api/ping', {
			headers: {
				Authorization: `Bearer ${bearer}`
			}
		});

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

			const name = (await res.text()).split(' ')[1];

			if (name) {
				console.log();
				console.log(pc.yellow(`Successfully authenticated as ${name}`));
			}

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
