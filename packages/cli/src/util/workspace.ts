import { existsSync } from 'fs';
import { join } from 'path';

export const resolveWorkspace = (dir = process.cwd()): string => {
	let workspace = dir;

	while (!existsSync(join(workspace, '.lnvrc')) && !existsSync(join(workspace, '.lnv'))) {
		const next = join(workspace, '..');

		if (next === workspace) {
			throw new Error('Failed to resolve workspace');
		}

		workspace = next;
	}

	return workspace;
};
