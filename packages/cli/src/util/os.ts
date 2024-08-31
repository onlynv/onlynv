import cp from 'node:child_process';
import os from 'node:os';

export const getDeviceName = () => {
	try {
		switch (process.platform) {
			case 'win32':
				return process.env.COMPUTERNAME;
			case 'darwin':
				return cp.execSync('scutil --get ComputerName').toString().trim();
			case 'linux':
				const prettyname = cp.execSync('hostnamectl --pretty').toString().trim();

				return prettyname === '' ? os.hostname() : prettyname;
			default:
				return os.hostname();
		}
	} catch (e) {
		return os.hostname();
	}
};

export const getOS = () => {
	switch (process.platform) {
		case 'win32':
			return 'Windows';
		case 'darwin':
			return 'macOS';
		case 'linux':
			return 'Linux';
		default:
			return 'Unknown';
	}
};

export const getIp = () => {
	const interfaces = os.networkInterfaces();

	for (const key in interfaces) {
		if (interfaces[key]) {
			for (const iface of interfaces[key]) {
				if (iface.family === 'IPv4' && !iface.internal) {
					return iface.address;
				}
			}
		}
	}

	return 'Unknown';
};
