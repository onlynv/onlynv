import pc from '@onlynv/shared/colors';
import type { InitResponse, InitStatusResponse } from '@onlynv/shared/structs/init';
import fs from 'fs';
import open from 'open';
import readline from 'readline';

import type { Interface } from '../interface';
import { getAuthority } from '../util/authority';
import { makeConfig } from '../util/config';
import { getConfirmation } from '../util/input';
import { getDeviceName, getIp, getOS } from '../util/os';
import { resolveWorkspace } from '../util/workspace';

export const poll = async <T>(
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
	const workspace = resolveWorkspace(process.cwd(), false);

	const URL = getAuthority({
		authority: (int.flags.authority as string) || '@onlynv/platform'
	});

	if (workspace && workspace === process.cwd()) {
		console.error('Cannot initialize new project in workspace root');

		return;
	}

	const res = await fetch(URL + '/api/init', {
		body: JSON.stringify({
			sender: '@onlynv/cli',
			sender_ip: getIp(),
			sender_device: getDeviceName(),
			sender_os: getOS()
		}),
		method: 'POST'
	}).catch((e) => {
		return e;
	});

	if (res instanceof Error) {
		console.log(pc.red('Could not establish connection with server'));

		process.exit(1);
	}

	try {
		const init = (await res.json()) as InitResponse;

		if (init?.error) {
			console.error('Failed to initialize project:', init.error);

			return;
		}

		console.log(pc.yellow('Initialising Project...'));
		console.log();

		console.log('Press ENTER to open in browser:');
		console.log(pc.gray(init.redirect_url));

		readline.emitKeypressEvents(process.stdin);
		process.stdin.setRawMode(true);

		const h: (_: unknown, data: { name: string; ctrl: boolean }) => void = (_, data) => {
			if (data.name === 'return') {
				open(init.redirect_url);
			}

			if (data.name === 'escape' || (data.ctrl && data.name === 'c')) {
				process.stdin.off('keypress', h);
				process.exit();
			}
		};

		process.stdin.on('keypress', h);

		console.log();

		const created = await poll<InitStatusResponse>(async (delay, cancel, resolve) => {
			try {
				const check = (await (await fetch(init.url || URL)).json()) as InitStatusResponse;

				if (check?.error) {
					process.stdin.off('keypress', h);
					console.error('Project error:', check.error);

					cancel();
				}

				if (check.status === 'done') {
					process.stdin.off('keypress', h);
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
					authority: '@onlynv/platform',
					connection: init.id,
					apispec: 1
				})
			);
		}
	} catch (e) {
		console.error('Failed to initialize project:', Error(e as string).message);
	}
};
