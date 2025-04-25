import type { Credentials } from '../shared/credentials';
import { type InitResponse, create } from './create';
import { type InitStatusResponse, get } from './get';

export const makeInit = (credentials: Credentials, authority: string) => {
	return {
		get: get.bind(null, credentials, authority),
		create: create.bind(null, credentials, authority)
	};
};

export namespace Init {
	export type CreateResponse = InitResponse;
	export type GetResponse = InitStatusResponse;
	export type Get = Awaited<ReturnType<typeof get>>;
	export type Create = Awaited<ReturnType<typeof create>>;
}
