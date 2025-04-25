import { endpoint } from '../shared/authority';
import type { Credentials } from '../shared/credentials';
import { type OrError, fail, ok } from '../shared/result';

export interface PingResponse {
	latency: number;
	isAuth: boolean;
	username?: string;
}

export const get = async (
	credentials: Credentials,
	authority: string
): Promise<OrError<PingResponse>> => {
	try {
		const start = Date.now();

		const response = await fetch(endpoint(authority, '/api/ping'), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${credentials.token}`
			}
		});

		const latency = Date.now() - start;

		if (response.status === 200) {
			const data = await response.text();

			const maybeName = data.split(' ')[1];

			return ok({
				latency,
				isAuth: !!maybeName,
				username: maybeName
			});
		} else {
			return fail(new Error(`Ping failed with status code ${response.status}`));
		}
	} catch (error) {
		return fail(new Error(`Ping failed: ${error}`));
	}
};
