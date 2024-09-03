import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const storageDir = path.join(os.homedir(), '.lnv');

if (!fs.existsSync(storageDir)) {
	fs.mkdirSync(storageDir);
}

export const setKey = (
	connectionId: string,
	key: 'default' | (string & {}),
	value: string | undefined
): void => {
	if (!value) {
		return;
	}

	const keyPath = path.join(storageDir, connectionId);

	if (!fs.existsSync(keyPath)) {
		fs.writeFileSync(keyPath, JSON.stringify({}));
	}

	const keys = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));

	keys[key] = value;

	fs.writeFileSync(keyPath, JSON.stringify(keys));
};

const cache: Record<string, Record<string, string>> = {};

export const getKey = (connectionId: string, key: 'default' | (string & {})): string => {
	try {
		if (!cache[connectionId]?.[key]) {
			const keyPath = path.join(storageDir, connectionId);

			if (!fs.existsSync(keyPath)) {
				fs.writeFileSync(keyPath, JSON.stringify({}));
			}

			cache[connectionId] = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
		}

		return cache[connectionId]?.[key] || '';
	} catch (e) {
		return '';
	}
};

export const getAllKeys = (connectionId: string): Record<string, string> => {
	try {
		if (!cache[connectionId]) {
			const keyPath = path.join(storageDir, connectionId);

			if (!fs.existsSync(keyPath)) {
				fs.writeFileSync(keyPath, JSON.stringify({}));
			}

			cache[connectionId] = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));

			return cache[connectionId] as Record<string, string>;
		}

		return cache[connectionId] as Record<string, string>;
	} catch (e) {
		return {};
	}
};
