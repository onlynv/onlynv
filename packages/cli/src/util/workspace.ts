import { existsSync } from 'fs';
import { join } from 'path';

export const resolveWorkspace = (dir = process.cwd(), fail = true): string => {
	let workspace = dir;

	while (!existsSync(join(workspace, '.lnvrc'))) {
		const next = join(workspace, '..');

		if (next === workspace) {
			if (fail) {
				throw new Error('Failed to resolve workspace');
			} else {
				return '';
			}
		}

		workspace = next;
	}

	return workspace;
};
