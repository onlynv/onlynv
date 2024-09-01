import type { Interface } from '../interface';
import open from 'open';
import pc from '@onlynv/shared/colors';

import fs from 'fs';

import type { InitResponse, InitStatusResponse } from '@onlynv/shared/structs/init';
import { getIp, getDeviceName, getOS } from '../util/os';
import { makeConfig } from '../util/config';
import { getConfirmation } from '../util/input';

const URL = process.env.npm_lifecycle_script ? 'http://localhost:3000' : 'https://onlynv.dev';

const poll = async <T>(
	cb: (
		delay: (ms: number) => Promise<void>,
		cancel: () => void,
		resolve: (t: T) => void
	) => Promise<void>,
	ms: number
) => {
	let cancel = false;
	let toResolve: T | undefined;

	const cancelCb = () => {
		cancel = true;
	};

	while (!cancel) {
		await cb(
			(nms?: number) => new Promise((resolve) => setTimeout(resolve, nms ?? ms)),
			cancelCb,
			(t) => {
				toResolve = t;
				cancel = true;
			}
		);
	}

	if (cancel && !toResolve) {
		throw 'cancelled';
	}

	return toResolve!;
};

export default async (int: Interface) => {
	if (int.flags['dry-run']) {
		console.log(pc.yellow('Dry run:'), 'Would have initialised a project');

		return;
	}

	const res = await fetch(URL + '/api/init', {
		body: JSON.stringify({
			sender: '@onlynv/cli',
			sender_ip: getIp(),
			sender_device: getDeviceName(),
			sender_os: getOS(),
			name: int.flags.name
		}),
		method: 'POST'
	});

	try {
		const init = (await res.json()) as InitResponse;

		console.log(pc.yellow('Initialising Project...'));

		open(init.redirect_url);

		const created = await poll<InitStatusResponse>(async (delay, cancel, resolve) => {
			try {
				const check = (await (await fetch(init.url || URL)).json()) as InitStatusResponse;

				if ('error' in check) {
					console.error('Project error:', check.error);

					cancel();
				}

				if (check.status === 'done') {
					resolve(check);
				}

				return delay(check.interval ?? 5000);
			} catch (e) {
				console.error('Failed to check project status:', Error(e as string).message);

				cancel();
			}
		}, init.interval ?? 5000);

		console.log(
			pc.green('Project created at'),
			created.project_url || URL + `/projects/${init.id}`
		);
		open(created.project_url || URL + `/projects/${init.id}`);

		const willConfig = await getConfirmation('Create configuration file?', true);

		if (willConfig) {
			await fs.promises.writeFile(
				'.lnvrc',
				makeConfig({
					authority: '@onlynv/cli',
					connection: init.id,
					apispec: 1
				})
			);
		}
	} catch (e) {
		console.error('Failed to initialize project:', Error(e as string).message);
	}
};
