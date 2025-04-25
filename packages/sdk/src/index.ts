import { makeInit } from './init';
import { makePing } from './ping';
import type { Credentials } from './shared/credentials';

export type { Ping } from './ping';
export type { Credentials } from './shared/credentials';

export class OnlyNv {
	authority = 'https://onlynv.dev';
	credentials: Credentials;

	constructor(options: {
		authority?: string;
		authentication: typeof OnlyNv.prototype.credentials;
	}) {
		this.authority = options.authority || this.authority;
		this.credentials = options.authentication;

		this.ping = makePing(this.credentials, this.authority);
		this.init = makeInit(this.credentials, this.authority);
	}

	ping: ReturnType<typeof makePing>;
	init: ReturnType<typeof makeInit>;
}
