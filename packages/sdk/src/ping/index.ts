import type { Credentials } from '../shared/credentials';
import { type PingResponse, get } from './get';

export const makePing = (credentials: Credentials, authority: string) => {
	return get.bind(null, credentials, authority);
};

export namespace Ping {
	export type Response = PingResponse;
	export type Get = Awaited<ReturnType<typeof get>>;
}
