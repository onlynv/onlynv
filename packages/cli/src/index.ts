import pkj from '../package.json';
import init from './commands/init';
import { createInterface } from './interface';
import pc from '@onlynv/shared/colors';

const int = createInterface();

if (int.isDefault) {
	int.showHelp();

	process.exit();
}

switch (int.command?.name) {
	case 'version':
		console.log(`${pc.yellow(pkj.name)} ${pc.green('v' + pkj.version)}`);
		break;
	case 'init':
		init(int);
		break;
	default:
		int.showHelp();

		process.exit();
}
