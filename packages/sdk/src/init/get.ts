import type { InitStatusResponse } from '@onlynv/shared/structs/init';

import { endpoint } from '../shared/authority';
import type { Credentials } from '../shared/credentials';
import { type OrError, fail, ok } from '../shared/result';

export type { InitStatusResponse } from '@onlynv/shared/structs/init';

export const get = async (
	credentials: Credentials,
	authority: string,
	id: string
): Promise<OrError<InitStatusResponse>> => {
	try {
		const response = await fetch(endpoint(authority, `/api/init/${id}`), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${credentials.token}`
			}
		});

		if (response.status === 200) {
			const data = await response.json();

			if (!data || typeof data !== 'object') {
				return fail(new Error('Invalid response format'));
			}

			if ('error' in data) {
				return fail(new Error(`Init lookup failed: ${data.error}`));
			}

			return ok(data as InitStatusResponse);
		} else if (response.status === 404) {
			return fail(new Error('Init not found'));
		} else {
			return fail(new Error(`Init lookup failed with status code ${response.status}`));
		}
	} catch (error) {
		return fail(new Error(`Init lookup failed: ${error}`));
	}
};
