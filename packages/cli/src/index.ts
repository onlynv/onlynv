import pc from '@onlynv/shared/colors';

import pkj from '../package.json';
import glob from './commands/glob';
import init from './commands/init';
import link from './commands/link';
import sync from './commands/sync';
import { createInterface } from './interface';
import { getConfig } from './util/config';
import { getAllKeys, setKey } from './util/storage';
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
	case 'key': {
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
				break;
			case 'list':
			default:
				const keys = getAllKeys(config.connection);

				if (Object.keys(keys).length === 0) {
					console.log(pc.red(`No keys available for ${config.connection}`));
					process.exit(1);
				}

				console.log('Keys:');
				console.log();
				for (const [key, val] of Object.entries(keys)) {
					console.log(`- ${key}: ${val}`);
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
