import pc from '@onlynv/shared/colors';
import path from 'path';

import pkj from '../package.json';
import glob from './commands/glob';
import init from './commands/init';
import link from './commands/link';
import ping from './commands/ping';
import strip from './commands/strip';
import sync from './commands/sync';
import dotype from './commands/type';
import { createInterface } from './interface';
import { getConfig } from './util/config';
import { getAllKeys, getKey, setKey } from './util/storage';
import { resolveWorkspace } from './util/workspace';

const int = createInterface();
const config = getConfig(resolveWorkspace(process.cwd(), false));

if (int.isDefault) {
	int.showHelp();

	process.exit();
}

switch (int.command?.name) {
	case 'version':
		console.log(`${pc.yellow(pkj.name)} ${pc.green('v' + pkj.version)}`);
		break;
	case 'ping':
		await ping(int);
		break;
	case 'init':
		await init(int);
		break;
	case 'link':
		await link(int);
		break;
	case 'glob':
		await glob(int);
		break;
	case 'sync':
		await sync(int);
		break;
	case 'type':
		await dotype(int);
		break;
	case 'strip':
		await strip(int);
		break;
	case 'stow': {
		switch (int.subcommand?.name) {
			case 'add':
				if (typeof int.flags.key !== 'string') {
					console.log(pc.red('Key is required'));
					process.exit(1);
				}

				if (typeof int.flags.name !== 'undefined' && typeof int.flags.name !== 'string') {
					console.log(pc.red('Name must be a string'));
					process.exit(1);
				}

				setKey(config.connection, int.flags.name || 'default', int.flags.key);
				break;
			case 'remove':
				if (typeof int.flags.id !== 'string') {
					console.log(pc.red('Name is required'));
					process.exit(1);
				}

				setKey(config.connection, int.flags.id, undefined);

				console.log(pc.green(`Key ${int.flags.id} removed`));
				break;
			case 'get':
				if (typeof int.flags.id !== 'string') {
					console.log(pc.red('Name is required'));
					process.exit(1);
				}

				const key = getKey(config.connection, int.flags.id || 'default');

				if (key === null) {
					console.log(
						pc.red(
							`Key ${int.flags.id || 'default'} not found for ${config.connection}`
						)
					);
					process.exit(1);
				}

				console.log(key);
				break;
			case 'list':
			default:
				const workspace = resolveWorkspace(process.cwd(), false);

				const keys = getAllKeys(config.connection);

				if (Object.keys(keys).length === 0) {
					console.log(pc.red(`No keys available for ${config.connection}`));
					process.exit(1);
				}

				console.log(
					pc.yellow(`Keys for ${path.basename(workspace)} (${config.connection})`)
				);
				console.log();
				for (const [key, val] of Object.entries(keys)) {
					console.log(`\t${key}: ${pc.red(`<${val.length} bytes>`)}`);
				}
				break;
		}
		break;
	}

	default:
		int.showHelp();
}

// clean up any open handles
process.exit();
